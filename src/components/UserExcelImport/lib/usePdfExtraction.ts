/* trunk-ignore-all(prettier) */
import { useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl as unknown as string;

export interface ExtractedCommitmentNoteData {
  numeroNota: string;
  dataNota: string;
  ug: string;
  valor: number;
  razaoSocial: string;
  cnpj: string;
  nomeResponsavelExtraido: string;
  cargoResponsavel?: string;
}

export const usePdfExtraction = () => {
  const extractCommitmentNoteData = useCallback(async (file: File): Promise<ExtractedCommitmentNoteData | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // 🔹 Une todas as páginas do PDF
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items as any[];
        fullText += textItems.map((t) => t.str).join(" ") + "\n";
      }

      // 🔹 Normaliza o texto
      fullText = fullText
        .replace(/\s{2,}/g, " ")
        .replace(/\n+/g, "\n")
        .trim();

      const extracted: ExtractedCommitmentNoteData = {
        numeroNota: "",
        dataNota: "",
        ug: "",
        valor: 0,
        razaoSocial: "",
        cnpj: "",
        nomeResponsavelExtraido: "",
        cargoResponsavel: "",
      };

      // 🔹 Padrões otimizados com base no PDF real
      const patterns = {
        numeroNota: [
          /\bNE\s*(\d{1,6})\b/i, // Ex: "2025 NE 748"
        ],
        dataNota: [
          /Data\s*de\s*Emiss[aã]o\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
          /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
        ],
        ug: [
          /C[eé]lula\s+Or[cç]ament[áa]ria\s*\d+\s+\d+\s+\d+\s+\d+\s+(\d{6})/i, // Ex: "167086"
        ],
        // 🔹 Novo padrão para capturar o valor da nota de empenho
        valor: [
          /(?:Taxa\s+de\s+C[aâ]mbio|Emiss[aã]o)[^0-9]+([\d.]+\s*,\s*\d{2})/i, // Ex: "Taxa de Câmbio ... 1.085,50"
          /(?:Total\s+da\s+Lista|Valor\s+Total)[^0-9]+([\d.]+\s*,\s*\d{2})/i, // Linha "Valor Total"
          /(\d{1,3}(?:\.\d{3})*,\d{2})(?![\s\S]*\d{1,3}(?:\.\d{3})*,\d{2})/, // Último valor monetário
        ],
        cnpj: [
          /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/,
        ],
        razaoSocial: [
          /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\s+([A-ZÀ-Ÿ0-9\s\.,\-&]+)/i, // "CNPJ Razão Social"
          /Favorecido\s+([A-ZÀ-Ÿ0-9\s\.,\-&]+)/i,
        ],
        nomeResponsavelExtraido: [
          /Respons[aá]vel\s+pela\s+Nota\s+de\s+Empenho\s*([A-ZÀ-Ÿ\s]+)/i,
        ],
        cargoResponsavel: [
          /Cargo[:\s]*([A-Za-zÀ-ÿ\s]+)/i,
        ],
      };

      const tryPatterns = (text: string, patternList: RegExp[]): string => {
        for (const pattern of patternList) {
          const match = text.match(pattern);
          if (match) return (match[1] || match[0]).trim();
        }
        return "";
      };

      extracted.numeroNota = tryPatterns(fullText, patterns.numeroNota);

      const dataResult = tryPatterns(fullText, patterns.dataNota);
      if (dataResult) {
        const parts = dataResult.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
        if (parts) {
          const [, dd, mm, yyyy] = parts;
          const d = String(dd).padStart(2, "0");
          const m = String(mm).padStart(2, "0");
          extracted.dataNota = `${yyyy}-${m}-${d}`;
        } else {
          const nums = dataResult.match(/\d+/g);
          if (nums && nums.length >= 3) {
            const [dRaw, mRaw, yRaw] = nums;
            const d = String(dRaw).padStart(2, "0");
            const m = String(mRaw).padStart(2, "0");
            extracted.dataNota = `${yRaw}-${m}-${d}`;
          } else {
            extracted.dataNota = dataResult; // fallback: mantém como foi extraído
          }
        }
      }

      extracted.ug = tryPatterns(fullText, patterns.ug);

      const valorResult = tryPatterns(fullText, patterns.valor);
      if (valorResult) {
        const normalizado = valorResult
          .replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(/,/g, ".");
        extracted.valor = parseFloat(normalizado) || 0;
      }

      extracted.cnpj = tryPatterns(fullText, patterns.cnpj);
      extracted.razaoSocial = tryPatterns(fullText, patterns.razaoSocial);
      extracted.nomeResponsavelExtraido = tryPatterns(fullText, patterns.nomeResponsavelExtraido);
      extracted.cargoResponsavel = tryPatterns(fullText, patterns.cargoResponsavel);

      console.log("🧾 Dados extraídos da Nota:", extracted);
      return extracted;
    } catch (error) {
      console.error("Erro ao extrair dados do PDF:", error);
      throw new Error("Não foi possível processar o PDF. Verifique se é um arquivo válido.");
    }
  }, []);

  return { extractCommitmentNoteData };
};
