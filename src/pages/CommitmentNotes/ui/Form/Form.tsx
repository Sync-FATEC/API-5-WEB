import { FC, FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommitmentNotesService, CreateCommitmentNoteDto, UpdateCommitmentNoteDto, CommitmentNote } from "@/services/commitmentNotesService";
import { SupplierService, Supplier } from "@/services/supplierService";
import { useAuth } from "@/contexts/useAuth";
import { RoleEnum } from "@/types/enums";
import { usePdfExtraction } from "@/components/UserExcelImport/lib/usePdfExtraction";
import { postFormDataWithFile } from "@/shared/api";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeCnpj(cnpj: string): string {
  return (cnpj || "").replace(/\D/g, "");
}

const CommitmentNoteForm: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === RoleEnum.ADMIN;
  const { extractCommitmentNoteData } = usePdfExtraction();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [showPdfPrompt, setShowPdfPrompt] = useState<boolean>(true);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  const [existingNote, setExistingNote] = useState<CommitmentNote | null>(null);

  // Campos de criação
  const [form, setForm] = useState<CreateCommitmentNoteDto>({
    supplierId: "",
    valor: 0,
    numeroNota: "",
    dataNota: "",
    ug: "",
    razaoSocial: "",
    cnpj: "",
    nomeResponsavelExtraido: "",
    cargoResponsavel: "",
    frequenciaCobrancaDias: 15,
    urgencia: "",
    dataPrevistaEntrega: addDays(new Date(), 30),
  });

  // Campos editáveis no update
  const [updateForm, setUpdateForm] = useState<UpdateCommitmentNoteDto>({
    cargoResponsavel: "",
    frequenciaCobrancaDias: 15,
    urgencia: "",
    dataPrevistaEntrega: addDays(new Date(), 30),
  });

  const isEdit = useMemo(() => !!id, [id]);

  useEffect(() => {
    const loadSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const service = new SupplierService();
        const list = await service.listSuppliers();
        setSuppliers(list);
      } catch (err) {
        console.error(err);
        // silencioso: fornecedor pode ser selecionado depois
      } finally {
        setLoadingSuppliers(false);
      }
    };
    loadSuppliers();
  }, []);

  // Seleciona fornecedor automaticamente com base no CNPJ digitado/extraído
  useEffect(() => {
    const cnpjDigits = normalizeCnpj(form.cnpj);
    if (!cnpjDigits || suppliers.length === 0) return;
    const match = suppliers.find((s) => normalizeCnpj(s.cnpj) === cnpjDigits);
    if (match) {
      setForm((prev) => ({
        ...prev,
        supplierId: match.id,
        razaoSocial: match.razaoSocial,
      }));
    }
  }, [form.cnpj, suppliers]);

  // Ao criar nova nota, mostra o prompt de PDF; em edição, não mostrar
  useEffect(() => {
    setShowPdfPrompt(!isEdit);
  }, [isEdit]);

  useEffect(() => {
    const loadExisting = async () => {
      if (!isEdit || !id) return;
      setLoading(true);
      setError(null);
      try {
        const service = new CommitmentNotesService();
        const note = await service.getById(id);
        setExistingNote(note);
        setUpdateForm({
          cargoResponsavel: note.cargoResponsavel || "",
          frequenciaCobrancaDias: note.frequenciaCobrancaDias || 15,
          urgencia: note.urgencia || "",
          dataPrevistaEntrega: note.dataPrevistaEntrega || addDays(new Date(), 30),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao carregar nota";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadExisting();
  }, [isEdit, id]);

  const handleSupplierChange = (supplierId: string) => {
    const s = suppliers.find((sp) => sp.id === supplierId);
    setForm((prev) => ({
      ...prev,
      supplierId,
      razaoSocial: s?.razaoSocial || prev.razaoSocial,
      cnpj: s?.cnpj || prev.cnpj,
    }));
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    
    // Armazenar o arquivo PDF para enviar depois
    setSelectedPdfFile(file);
    console.log(`📁 [Frontend] Arquivo selecionado para upload:`, file.name, `(${file.size} bytes)`);
    
    setExtracting(true);
    setError(null);
    try {
      const extractedData = await extractCommitmentNoteData(file);
      if (extractedData) {
        setForm((prev) => ({
          ...prev,
          numeroNota: extractedData.numeroNota || prev.numeroNota,
          valor: extractedData.valor || prev.valor,
          dataNota: extractedData.dataNota || prev.dataNota,
          ug: extractedData.ug || prev.ug,
          nomeResponsavelExtraido: extractedData.nomeResponsavelExtraido || prev.nomeResponsavelExtraido,
          razaoSocial: extractedData.razaoSocial || prev.razaoSocial,
          cnpj: extractedData.cnpj || prev.cnpj,
          cargoResponsavel: extractedData.cargoResponsavel || prev.cargoResponsavel,
        }));
        // Fecha o prompt após extração bem-sucedida
        setShowPdfPrompt(false);
        setError(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar PDF";
      setError(msg);
    } finally {
      setExtracting(false);
    }
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("Apenas ADMIN pode criar notas");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Usar a função que suporta multipart/form-data com arquivo
      const response = await postFormDataWithFile<CreateCommitmentNoteDto, CommitmentNote>(
        '/commitment-notes',
        { ...form },
        selectedPdfFile || undefined
      );
      
      if (response.data) {
        navigate(`/commitment-notes/${response.data.id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar nota";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !id) {
      setError("Apenas ADMIN pode atualizar notas");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const service = new CommitmentNotesService();
      const payload: UpdateCommitmentNoteDto = { ...updateForm };
      const updated = await service.update(id, payload);
      navigate(`/commitment-notes/${updated.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar nota";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{isEdit ? "Editar Nota de Empenho" : "Nova Nota de Empenho"}</h1>
          <p className="text-sm text-base-content/70 sm:text-base">Preencha os dados ou extraia de um PDF</p>
        </div>
      </div>

      {/* Prompt inicial para upload de PDF ao criar nova nota */}
      {!isEdit && showPdfPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/60 p-4">
          <div className="rounded-box bg-base-100 shadow-xl border border-base-300 w-full max-w-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Deseja extrair os dados de um PDF?</h2>
            <p className="text-sm text-base-content/70">Faça upload do PDF para preencher os campos automaticamente. Se preferir, você pode prosseguir e preencher tudo manualmente.</p>
            <div className="space-y-2">
              <label className="label"><span className="label-text">Upload de PDF (extração automática)</span></label>
              <input
                type="file"
                accept="application/pdf"
                className="file-input file-input-bordered w-full"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                disabled={extracting}
              />
              <label className="label">
                <span className="label-text-alt">{extracting ? "Processando PDF..." : "O PDF será processado e os campos serão preenchidos automaticamente."}</span>
              </label>
              {error && (
                <div className="alert alert-warning mt-2"><span>{error}</span></div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => setShowPdfPrompt(false)} disabled={extracting}>Prosseguir manualmente</button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Formulário de criação */}
      {!isEdit && (
        <form onSubmit={handleCreateSubmit} className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label"><span className="label-text">Fornecedor</span></label>
              <select className="select select-bordered w-full" value={form.supplierId} onChange={(e) => handleSupplierChange(e.target.value)}>
                <option value="">Selecione...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.razaoSocial}</option>
                ))}
              </select>
              {loadingSuppliers && (<span className="text-xs text-base-content/60">Carregando fornecedores...</span>)}
            </div>
            <div>
              <label className="label"><span className="label-text">Razão Social</span></label>
              <input className="input input-bordered w-full" value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">CNPJ</span></label>
              <input className="input input-bordered w-full" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Número da Nota</span></label>
              <input className="input input-bordered w-full" value={form.numeroNota} onChange={(e) => setForm({ ...form, numeroNota: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Valor</span></label>
              <input type="number" step="0.01" className="input input-bordered w-full" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label"><span className="label-text">UG</span></label>
              <input className="input input-bordered w-full" value={form.ug} onChange={(e) => setForm({ ...form, ug: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Data da Nota</span></label>
              <input type="date" className="input input-bordered w-full" value={form.dataNota} onChange={(e) => setForm({ ...form, dataNota: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Data Prevista de Entrega</span></label>
              <input type="date" className="input input-bordered w-full" value={form.dataPrevistaEntrega} onChange={(e) => setForm({ ...form, dataPrevistaEntrega: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Frequência de Cobrança (dias)</span></label>
              <input type="number" className="input input-bordered w-full" value={form.frequenciaCobrancaDias ?? 15} onChange={(e) => setForm({ ...form, frequenciaCobrancaDias: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Urgência</span></label>
              <input className="input input-bordered w-full" value={form.urgencia ?? ""} onChange={(e) => setForm({ ...form, urgencia: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Responsável</span></label>
              <input className="input input-bordered w-full" value={form.nomeResponsavelExtraido ?? ""} onChange={(e) => setForm({ ...form, nomeResponsavelExtraido: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Cargo do Responsável</span></label>
              <input className="input input-bordered w-full" value={form.cargoResponsavel ?? ""} onChange={(e) => setForm({ ...form, cargoResponsavel: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" className="btn" onClick={() => navigate("/commitment-notes")}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      )}

      {/* Formulário de edição */}
      {isEdit && existingNote && (
        <form onSubmit={handleUpdateSubmit} className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Valor não é editável no update, removido do formulário */}
            <div>
              <label className="label"><span className="label-text">Cargo do Responsável</span></label>
              <input className="input input-bordered w-full" value={updateForm.cargoResponsavel ?? ""} onChange={(e) => setUpdateForm({ ...updateForm, cargoResponsavel: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Frequência de Cobrança (dias)</span></label>
              <input type="number" className="input input-bordered w-full" value={updateForm.frequenciaCobrancaDias ?? 15} onChange={(e) => setUpdateForm({ ...updateForm, frequenciaCobrancaDias: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Urgência</span></label>
              <input className="input input-bordered w-full" value={updateForm.urgencia ?? ""} onChange={(e) => setUpdateForm({ ...updateForm, urgencia: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Data Prevista de Entrega</span></label>
              <input type="date" className="input input-bordered w-full" value={updateForm.dataPrevistaEntrega ?? existingNote.dataPrevistaEntrega ?? ""} onChange={(e) => setUpdateForm({ ...updateForm, dataPrevistaEntrega: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="btn" onClick={() => navigate(`/commitment-notes/${existingNote.id}`)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Salvando..." : "Salvar alterações"}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommitmentNoteForm;