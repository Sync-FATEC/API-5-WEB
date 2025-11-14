import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CommitmentNotesService, CommitmentNote } from "@/services/commitmentNotesService";
import { useAuth } from "@/contexts/useAuth";
import { RoleEnum } from "@/types/enums";

const CommitmentNotes: FC = () => {
  const [notes, setNotes] = useState<CommitmentNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === RoleEnum.ADMIN;

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const service = new CommitmentNotesService();
      const list = await service.list();
      setNotes(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao listar notas de empenho";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Tem certeza que deseja remover esta nota?")) return;
    try {
      const service = new CommitmentNotesService();
      await service.remove(id);
      await fetchNotes();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao remover nota";
      setError(msg);
    }
  };

  const renderResponsavel = (n: CommitmentNote) => {
    if (n.nomeResponsavelManualOverride) {
      return n.nomeResponsavelManual || "—";
    }
    return n.nomeResponsavelExtraido || "—";
  };

  const renderPrazo = (n: CommitmentNote) => {
    if (n.atrasado) {
      return (
        <span className="text-error font-medium">Atrasou {n.diasAtraso} dias</span>
      );
    }
    return (
      <span className="text-success font-medium">Faltam {n.diasRestantesEntrega} dias</span>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Notas de Empenho</h1>
          <p className="text-sm text-base-content/70 sm:text-base">
            Acompanhe prazos, responsáveis e informações da nota
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/suppliers" className="btn-outline btn btn-sm sm:btn-md">Fornecedores</Link>
          {isAdmin && (
            <button className="btn-primary btn btn-sm sm:btn-md" onClick={() => navigate("/commitment-notes/new")}>Nova Nota</button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center text-base-content/70">Carregando notas...</div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-box border border-base-300 bg-base-100 p-3 sm:p-4">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-base-200">
                <tr>
                  <th>Número</th>
                  <th>Fornecedor</th>
                  <th>UG</th>
                  <th>Valor</th>
                  <th>Data da Nota</th>
                  <th>Prevista</th>
                  <th>Prazo</th>
                  <th>Responsável</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.id} className="hover">
                    <td className="font-medium">{n.numeroNota}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium">{n.razaoSocial}</span>
                        <span className="text-xs text-base-content/60">{n.cnpj}</span>
                      </div>
                    </td>
                    <td>{n.ug}</td>
                    <td>R$ {n.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td>{n.dataNota}</td>
                    <td>{n.dataPrevistaEntrega || "—"}</td>
                    <td>{renderPrazo(n)}</td>
                    <td>{renderResponsavel(n)}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-xs" onClick={() => navigate(`/commitment-notes/${n.id}`)}>Ver</button>
                        {isAdmin && (
                          <>
                            <button className="btn btn-xs btn-error" onClick={() => handleDelete(n.id)}>Remover</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {notes.length === 0 && (
            <div className="text-center text-sm text-base-content/60">Nenhuma nota encontrada.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommitmentNotes;