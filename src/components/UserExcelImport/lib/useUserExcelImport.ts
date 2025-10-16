import { useCallback, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { postJson } from "@/shared/api";

export type ParsedUser = {
  name: string;
  email: string;
  role: string;
};

export type UseUserExcelImport = {
  users: ParsedUser[];
  errors: string[];
  isParsing: boolean;
  isSubmitting: boolean;
  onFileChange: (file?: File) => Promise<void>;
  submit: () => Promise<void>;
  clear: () => void;
};

const headerAliases: Record<string, keyof ParsedUser> = {
  name: "name",
  nome: "name",
  "full name": "name",
  email: "email",
  "e-mail": "email",
  mail: "email",
  role: "role",
  papel: "role",
  cargo: "role",
  perfil: "role",
};

function normalizeHeader(h: string | undefined): string | undefined {
  if (!h) return undefined;
  return h.toString().trim().toLowerCase();
}

export function useUserExcelImport(): UseUserExcelImport {
  const [users, setUsers] = useState<ParsedUser[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clear = useCallback(() => {
    setUsers([]);
    setErrors([]);
  }, []);

  const onFileChange = useCallback(async (file?: File) => {
    clear();
    if (!file) return;
    setIsParsing(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const firstSheet = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheet];
      if (!sheet) throw new Error("Planilha não encontrada no arquivo");

      // Get rows as array of objects using first row as header
      const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

      if (!raw.length) throw new Error("Arquivo sem dados");

      // Build header map based on first object's keys
      const sample = raw[0];
      const map: Partial<Record<string, keyof ParsedUser>> = {};
      Object.keys(sample).forEach((key) => {
        const alias = headerAliases[normalizeHeader(key) || ""];
        if (alias) map[key] = alias;
      });

      if (!Object.values(map).includes("name") || !Object.values(map).includes("email") || !Object.values(map).includes("role")) {
        throw new Error("Cabeçalhos esperados não encontrados: name/nome, email/e-mail, role/papel/cargo/perfil");
      }

      const parsed: ParsedUser[] = raw.map((row, idx) => {
        const u: Partial<ParsedUser> = {};
        for (const [key, alias] of Object.entries(map)) {
          if (!alias) continue;
          const v = row[key];
          if (typeof v === "number") {
            u[alias] = String(v);
          } else if (typeof v === "string") {
            u[alias] = v.trim();
          } else if (v == null) {
            u[alias] = "" as any;
          } else {
            u[alias] = String(v);
          }
        }
        const user = {
          name: u.name || "",
          email: (u.email || "").toLowerCase(),
          role: u.role || "",
        } as ParsedUser;

        const rowErrors: string[] = [];
        if (!user.name) rowErrors.push(`Linha ${idx + 2}: nome ausente`);
        if (!user.email) rowErrors.push(`Linha ${idx + 2}: email ausente`);
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) rowErrors.push(`Linha ${idx + 2}: email inválido`);
        if (!user.role) rowErrors.push(`Linha ${idx + 2}: role/papel ausente`);

        if (rowErrors.length) setErrors((e) => [...e, ...rowErrors]);
        return user;
      });

      // dedupe by email
      const seen = new Set<string>();
      const deduped = parsed.filter((u) => {
        if (!u.email) return false;
        if (seen.has(u.email)) return false;
        seen.add(u.email);
        return true;
      });

      setUsers(deduped);
    } catch (e: any) {
      setErrors((prev) => [...prev, e?.message || "Falha ao ler o Excel"]);
    } finally {
      setIsParsing(false);
    }
  }, [clear]);

  const submit = useCallback(async () => {
    if (!users.length) {
      setErrors((e) => [...e, "Nenhum usuário para enviar"]);
      return;
    }
    setIsSubmitting(true);
    try {
      // Backend expects { users: UsersType[] }
      await postJson<{ users: ParsedUser[] }, any>("/users", { users });
    } catch (e: any) {
      setErrors((prev) => [...prev, e?.message || "Falha ao enviar dados"]);
    } finally {
      setIsSubmitting(false);
    }
  }, [users]);

  return useMemo(() => ({ users, errors, isParsing, isSubmitting, onFileChange, submit, clear }), [users, errors, isParsing, isSubmitting, onFileChange, submit, clear]);
}
