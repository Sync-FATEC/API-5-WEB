import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommitmentNotesService, CommitmentNote, UpdateAdminFieldsDto } from "@/services/commitmentNotesService";
import { useAuth } from "@/contexts/useAuth";
import { RoleEnum } from "@/types/enums";

const CommitmentNoteDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === RoleEnum.ADMIN;
  const [note, setNote] = useState<CommitmentNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminFields, setAdminFields] = useState<UpdateAdminFieldsDto>({});
  const [finalizing, setFinalizing] = useState(false);

  const formatDateBR = (value?: string | null) => {
    if (!value) return "—";
    const str = String(value);
    const hasTime = /T\d{2}:\d{2}|\s\d{2}:\d{2}/.test(str);
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      if (hasTime) {
        return new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(d);
      }
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    }
    // Fallback básico quando não parseia como Date
    const datePart = str.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [yyyy, mm, dd] = datePart.split("-");
      const base = `${dd}/${mm}/${yyyy}`;
      if (hasTime) {
        const timePart = str.slice(11, 16);
        return `${base} ${timePart}`;
      }
      return base;
    }
    return str;
  };

  const fetchNote = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const service = new CommitmentNotesService();
      const data = await service.getById(id);
      setNote(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar nota";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (note) {
      setAdminFields({
        processoAdm: note.processoAdm ?? false,
        materialRecebido: note.materialRecebido ?? false,
        nfEntregueNoAlmox: note.nfEntregueNoAlmox ?? false,
        justificativaMais60Dias: note.justificativaMais60Dias ?? "",
        enviadoParaLiquidar: note.enviadoParaLiquidar ?? false,
      });
    }
  }, [note]);

  const renderResponsavel = () => {
    if (!note) return "—";
    return note.nomeResponsavelManualOverride
      ? note.nomeResponsavelManual || "—"
      : note.nomeResponsavelExtraido || "—";
  };

  const renderPrazo = () => {
    if (!note) return null;
    if (note.atrasado) {
      return (
        <span className="text-error font-semibold">ATRASOU {note.diasAtraso} DIAS</span>
      );
    }
    return (
      <span className="text-success font-semibold">FALTA {note.diasRestantesEntrega} DIAS</span>
    );
  };

  const handleSaveAdminFields = async () => {
    if (!id || !isAdmin) return;
    setSavingAdmin(true);
    setError(null);
    try {
      const service = new CommitmentNotesService();
      const updated = await service.updateAdminFields(id, adminFields);
      setNote(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar campos administrativos";
      setError(msg);
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleFinalize = async () => {
    if (!id || !isAdmin) return;
    setFinalizing(true);
    setError(null);
    try {
      const service = new CommitmentNotesService();
      const updated = await service.finalize(id);
      setNote(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao finalizar nota";
      setError(msg);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">Detalhes da Nota</h1>
            {note?.finalizada && (
              <span className="badge badge-success">Finalizada</span>
            )}
          </div>
          <p className="text-sm text-base-content/70 sm:text-base">Visualize informações e prazos</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={() => navigate('/commitment-notes')}>Voltar</button>
          {isAdmin && id && note && !note.finalizada && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/commitment-notes/${id}/edit`)}>Editar</button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center text-base-content/70">Carregando...</div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && note && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-2 text-lg font-semibold">Informações</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Número:</span> {note.numeroNota}</p>
              <p><span className="font-medium">Valor:</span> R$ {note.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><span className="font-medium">UG:</span> {note.ug}</p>
              <p><span className="font-medium">Data da Nota:</span> {formatDateBR(note.dataNota)}</p>
              <p><span className="font-medium">Prevista:</span> {formatDateBR(note.dataPrevistaEntrega)}</p>
              <p><span className="font-medium">Prazo:</span> {renderPrazo()}</p>
              <p><span className="font-medium">Status:</span> {note.finalizada ? 'Finalizada' : 'Em aberto'}</p>
              <p><span className="font-medium">Data de Finalização:</span> {formatDateBR(note.dataFinalizacao)}</p>
            </div>
          </div>
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-2 text-lg font-semibold">Fornecedor</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Razão Social:</span> {note.razaoSocial}</p>
              <p><span className="font-medium">CNPJ:</span> {note.cnpj}</p>
            </div>
            <h2 className="mt-4 mb-2 text-lg font-semibold">Responsável</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Nome:</span> {renderResponsavel()}</p>
              <p><span className="font-medium">Cargo:</span> {note.cargoResponsavel || '—'}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="md:col-span-2 rounded-box border border-base-300 bg-base-100 p-4">
              <h2 className="mb-2 text-lg font-semibold">Campos Administrativos</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="label cursor-pointer">
                  <span className="label-text">Processo Administrativo</span>
                  <input type="checkbox" className="toggle" checked={adminFields.processoAdm ?? false} onChange={(e) => setAdminFields({ ...adminFields, processoAdm: e.target.checked })} disabled={note.finalizada} />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text">Material Recebido</span>
                  <input type="checkbox" className="toggle" checked={adminFields.materialRecebido ?? false} onChange={(e) => setAdminFields({ ...adminFields, materialRecebido: e.target.checked })} disabled={note.finalizada} />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text">NF Entregue no Almox</span>
                  <input type="checkbox" className="toggle" checked={adminFields.nfEntregueNoAlmox ?? false} onChange={(e) => setAdminFields({ ...adminFields, nfEntregueNoAlmox: e.target.checked })} disabled={note.finalizada} />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text">Enviado para Liquidar</span>
                  <input type="checkbox" className="toggle" checked={adminFields.enviadoParaLiquidar ?? false} onChange={(e) => setAdminFields({ ...adminFields, enviadoParaLiquidar: e.target.checked })} disabled={note.finalizada} />
                </label>
                <div className="md:col-span-2">
                  <label className="label"><span className="label-text">Justificativa &gt; 60 dias</span></label>
                  <textarea className="textarea textarea-bordered w-full" rows={3} value={adminFields.justificativaMais60Dias ?? ''} onChange={(e) => setAdminFields({ ...adminFields, justificativaMais60Dias: e.target.value })} disabled={note.finalizada} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="btn" onClick={handleSaveAdminFields} disabled={savingAdmin || note.finalizada}>Salvar Administrativo</button>
                <button className="btn btn-primary" onClick={handleFinalize} disabled={finalizing || note.finalizada}>Finalizar Nota de Empenho</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommitmentNoteDetail;