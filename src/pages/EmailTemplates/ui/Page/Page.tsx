import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { RoleEnum } from '@/types/enums';
import { EmailTemplatesService, EmailTemplate, PreviewResponse } from '@/services/emailTemplatesService';

const EmailTemplatesPage: FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === RoleEnum.ADMIN;

  const [allowedVars, setAllowedVars] = useState<string[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [vars, setVars] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSubject, setCreateSubject] = useState('Solicitação por NE {NUMERO_NE}');
  const [createHtml, setCreateHtml] = useState('');

  const subjectRef = useRef<HTMLTextAreaElement | null>(null);
  const htmlRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeField, setActiveField] = useState<'subject' | 'html'>('html');

  const service = useMemo(() => new EmailTemplatesService(), []);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [vars, list] = await Promise.all([
          service.getAllowedVars(),
          service.listTemplates()
        ]);
        setAllowedVars(vars);
        setTemplates(list);
        if (list.length) {
          selectTemplate(list[0]);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro ao carregar dados';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin, service]);

  const selectTemplate = (t: EmailTemplate) => {
    setSelected(t);
    setSubject(t.subject);
    setHtml(t.html);
    setPreview(null);
  };

  const handleInsertToken = (token: string) => {
    const text = `{${token}}`;
    if (activeField === 'subject') {
      const el = subjectRef.current;
      if (!el) return;
      const start = el.selectionStart || subject.length;
      const end = el.selectionEnd || subject.length;
      const next = subject.slice(0, start) + text + subject.slice(end);
      setSubject(next);
      setTimeout(() => el.setSelectionRange(start + text.length, start + text.length));
    } else {
      const el = htmlRef.current;
      if (!el) return;
      const start = el.selectionStart || html.length;
      const end = el.selectionEnd || html.length;
      const next = html.slice(0, start) + text + html.slice(end);
      setHtml(next);
      setTimeout(() => el.setSelectionRange(start + text.length, start + text.length));
    }
  };

  const handleVarChange = (key: string, value: string) => {
    setVars((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = () => {
    setShowCreateModal(true);
    setError(null);
  };

  const handleCreateSubmit = async () => {
    if (!createName.trim()) {
      setError('Informe o nome do template');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created = await service.createTemplate({ name: createName.trim(), subject: createSubject || '', html: createHtml || '' });
      const list = await service.listTemplates();
      setTemplates(list);
      selectTemplate(created);
      setShowCreateModal(false);
      setCreateName('');
      setCreateSubject('Solicitação por NE {NUMERO_NE}');
      setCreateHtml('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar template';
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await service.updateTemplate(selected.id, { subject, html });
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      selectTemplate(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar template';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const p = await service.previewTemplate(selected.id, vars);
      setPreview(p);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao gerar preview';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-base-300 bg-base-100 p-6">
          <div className="text-lg font-semibold">Acesso restrito</div>
          <div className="text-sm text-base-content/70">Somente administradores podem gerenciar templates de email.</div>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold">Templates de Email</h1>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-base-300 bg-base-100">
              <div className="border-b border-base-300 p-3 font-semibold">Lista</div>
              <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
                <div className="divide-y">
                  {templates
                    .filter((t) =>
                      [t.type, t.subject].some((v) => v.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => selectTemplate(t)}
                      className={`flex w-full items-start justify-between gap-3 p-3 text-left ${selected?.id === t.id ? 'bg-base-200' : ''}`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{t.type}</div>
                        <div className="truncate text-xs text-base-content/70">{t.subject}</div>
                      </div>
                      <div className="text-xs text-base-content/50 whitespace-nowrap">{new Date(t.updatedAt).toLocaleString()}</div>
                    </button>
                  ))}
                  {!templates.length && (
                    <div className="p-3 text-sm text-base-content/70">Nenhum template encontrado</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="rounded-lg border border-base-300 bg-base-100">
              <div className="border-b border-base-300 p-3 font-semibold">Editor</div>
              <div className="p-3">
                <div className="mb-3 flex flex-wrap gap-2">
                  {allowedVars.map((v) => (
                    <button key={v} className="badge badge-outline" onClick={() => handleInsertToken(v)}>{v}</button>
                  ))}
                </div>

                <div className="grid gap-4 grid-cols-1 xl:grid-cols-12">
                  <div className="xl:col-span-7">
                    <label className="mb-1 block text-sm font-medium">Assunto</label>
                    <textarea
                      ref={subjectRef}
                      value={subject}
                      onFocus={() => setActiveField('subject')}
                      onChange={(e) => setSubject(e.target.value)}
                      className="textarea textarea-bordered mb-3 h-20 w-full"
                    />

                    <label className="mb-1 block text-sm font-medium">HTML</label>
                    <textarea
                      ref={htmlRef}
                      value={html}
                      onFocus={() => setActiveField('html')}
                      onChange={(e) => setHtml(e.target.value)}
                      className="textarea textarea-bordered h-[28rem] w-full font-mono"
                    />
                  </div>
                  <div className="xl:col-span-5">
                    <div className="rounded-lg border border-base-200">
                      <div className="border-b border-base-200 p-3 text-sm font-semibold">Variáveis</div>
                      <div className="p-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                        {allowedVars.map((v) => (
                          <div key={v} className="space-y-1">
                            <label className="block text-xs font-medium text-base-content/70">{v}</label>
                            <input
                              value={vars[v] || ''}
                              onChange={(e) => handleVarChange(v, e.target.value)}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button className="btn btn-primary" onClick={handleSave} disabled={loading || !selected}>Salvar</button>
                  <button className="btn" onClick={handlePreview} disabled={loading || !selected}>Preview</button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-base-300 bg-base-100">
              <div className="border-b border-base-300 p-3 font-semibold">Preview</div>
              <div className="p-3">
                {preview ? (
                  <div className="space-y-3">
                    <div className="rounded border border-base-300 p-2 text-sm">{preview.subject}</div>
                    <div className="rounded border border-base-300 p-2" dangerouslySetInnerHTML={{ __html: preview.html }} />
                    {!!preview.missing?.length && (
                      <div className="text-sm text-warning">Variáveis faltando: {preview.missing.join(', ')}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-base-content/70">Gere um preview para visualizar o resultado</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
              <h3 className="font-bold text-lg">Novo Template</h3>
              <div className="mt-4 space-y-3">
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Nome do template (ex: cobranca)"
                  className="input input-bordered w-full"
                />
                <textarea
                  value={createSubject}
                  onChange={(e) => setCreateSubject(e.target.value)}
                  placeholder="Assunto"
                  className="textarea textarea-bordered w-full"
                />
                <textarea
                  value={createHtml}
                  onChange={(e) => setCreateHtml(e.target.value)}
                  placeholder="HTML do template"
                  className="textarea textarea-bordered w-full h-48 font-mono"
                />
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleCreateSubmit} disabled={creating}>Salvar</button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}></div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EmailTemplatesPage;