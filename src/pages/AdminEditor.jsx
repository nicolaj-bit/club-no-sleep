import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Plus, Pencil, Trash2, Eye, EyeOff, FileText, BookOpen, Upload, Bell, Scale, HelpCircle } from 'lucide-react';
import PushNotificationSender from '@/components/admin/PushNotificationSender';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TABS = ['BlogPost', 'KnowledgeArticle', 'LegalContent', 'HelpModal'];

const emptyBlog = { title: '', excerpt: '', content: '', category: '', featured_image: '', author_name: '', published: true, published_date: '' };
const emptyArticle = { title: '', content: '', category: '', is_faq: false, order: 0 };
const emptyLegal = { type: 'faq', title: '', content: '' };

export default function AdminEditor() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('BlogPost');
  const [editing, setEditing] = useState(null); // null = list view, object = edit view
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [helpConfig, setHelpConfig] = useState(null);
  const [helpForm, setHelpForm] = useState({});
  const [helpSaving, setHelpSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') base44.auth.redirectToLogin();
      else setUser(u);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: blogPosts = [], isLoading: loadingBlogs } = useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
    enabled: activeTab === 'BlogPost',
  });

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['adminArticles'],
    queryFn: () => base44.entities.KnowledgeArticle.list('order', 100),
    enabled: activeTab === 'KnowledgeArticle',
  });

  const { data: legalItems = [], isLoading: loadingLegal } = useQuery({
    queryKey: ['adminLegal'],
    queryFn: () => base44.entities.LegalContent.list('-created_date', 50),
    enabled: activeTab === 'LegalContent',
  });

  useEffect(() => {
    if (activeTab !== 'HelpModal') return;
    base44.entities.AppConfig.filter({ key: 'help_modal' }).then(results => {
      const config = results[0] || { key: 'help_modal', help_about_text_da: '', help_about_text_en: '', help_contact_email: '', help_faq_url: '' };
      setHelpConfig(config);
      setHelpForm({ ...config });
    });
  }, [activeTab]);

  const saveBlogMutation = useMutation({
    mutationFn: async (data) => {
      if (isNew) return base44.entities.BlogPost.create(data);
      return base44.entities.BlogPost.update(editing.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBlogPosts']);
      queryClient.invalidateQueries(['blogPosts']);
      toast.success('Gemt!');
      setEditing(null);
    },
  });

  const saveArticleMutation = useMutation({
    mutationFn: async (data) => {
      if (isNew) return base44.entities.KnowledgeArticle.create(data);
      return base44.entities.KnowledgeArticle.update(editing.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminArticles']);
      toast.success('Gemt!');
      setEditing(null);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminBlogPosts']); toast.success('Slettet'); },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id) => base44.entities.KnowledgeArticle.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminArticles']); toast.success('Slettet'); },
  });

  const saveLegalMutation = useMutation({
    mutationFn: async (data) => {
      if (isNew) return base44.entities.LegalContent.create(data);
      return base44.entities.LegalContent.update(editing.id, data);
    },
    onSuccess: () => { queryClient.invalidateQueries(['adminLegal']); toast.success('Gemt!'); setEditing(null); },
  });

  const deleteLegalMutation = useMutation({
    mutationFn: (id) => base44.entities.LegalContent.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminLegal']); toast.success('Slettet'); },
  });

  const handleSaveHelp = async () => {
    setHelpSaving(true);
    if (helpConfig?.id) {
      await base44.entities.AppConfig.update(helpConfig.id, helpForm);
    } else {
      const created = await base44.entities.AppConfig.create({ ...helpForm, key: 'help_modal' });
      setHelpConfig(created);
    }
    setHelpSaving(false);
    toast.success('Gemt!');
  };

  const handleNew = () => {
    setIsNew(true);
    if (activeTab === 'BlogPost') setEditing({ ...emptyBlog });
    else if (activeTab === 'KnowledgeArticle') setEditing({ ...emptyArticle });
    else setEditing({ ...emptyLegal });
  };

  const handleEdit = (item) => {
    setIsNew(false);
    setEditing({ ...item });
  };

  const handleSave = () => {
    if (activeTab === 'BlogPost') saveBlogMutation.mutate(editing);
    else if (activeTab === 'KnowledgeArticle') saveArticleMutation.mutate(editing);
    else saveLegalMutation.mutate(editing);
  };

  const handleDelete = (id) => {
    if (!confirm('Er du sikker?')) return;
    if (activeTab === 'BlogPost') deleteBlogMutation.mutate(id);
    else if (activeTab === 'KnowledgeArticle') deleteArticleMutation.mutate(id);
    else deleteLegalMutation.mutate(id);
  };

  if (!user) return null;

  // ── EDIT VIEW ──────────────────────────────────────────────
  if (editing) {
    const isBlog = activeTab === 'BlogPost';
    const isLegal = activeTab === 'LegalContent';
    const isSaving = saveBlogMutation.isPending || saveArticleMutation.isPending || saveLegalMutation.isPending;

    return (
      <div className="min-h-screen pb-12" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Header */}
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => setEditing(null)} className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h1 className="flex-1 font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {isNew ? 'Nyt indlæg' : 'Rediger'} — {isBlog ? 'Blog' : isLegal ? 'Juridisk indhold' : 'Artikel'}
          </h1>
          <Button size="sm" onClick={handleSave} disabled={isSaving}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {isSaving ? 'Gemmer...' : 'Gem'}
          </Button>
        </div>

        <div className="p-4 space-y-5 max-w-2xl mx-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Titel</Label>
            <Input
              value={editing.title || ''}
              onChange={e => setEditing({ ...editing, title: e.target.value })}
              placeholder="Titel..."
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Blog-only fields */}
          {isBlog && (
            <>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>Uddrag (excerpt)</Label>
                <textarea
                  value={editing.excerpt || ''}
                  onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Kort uddrag..."
                  rows={3}
                  className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>Forfatter</Label>
                <Input
                  value={editing.author_name || ''}
                  onChange={e => setEditing({ ...editing, author_name: e.target.value })}
                  placeholder="Navn..."
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>Billede</Label>
                {editing.featured_image && (
                  <img src={editing.featured_image} alt="preview" className="w-full h-40 object-cover rounded-xl" />
                )}
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm w-fit"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploader...' : 'Vælg billede'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setEditing(prev => ({ ...prev, featured_image: file_url }));
                      setUploading(false);
                    }}
                  />
                </label>
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>Publiceringsdato</Label>
                <Input
                  type="date"
                  value={editing.published_date || ''}
                  onChange={e => setEditing({ ...editing, published_date: e.target.value })}
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditing({ ...editing, published: !editing.published })}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: editing.published ? '#22c55e20' : 'var(--color-bg-subtle)',
                    color: editing.published ? '#16a34a' : 'var(--color-text-muted)'
                  }}
                >
                  {editing.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {editing.published ? 'Publiceret' : 'Skjult'}
                </button>
              </div>
            </>
          )}

          {/* Kategori */}
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Kategori</Label>
            <Input
              value={editing.category || ''}
              onChange={e => setEditing({ ...editing, category: e.target.value })}
              placeholder="Kategori..."
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Article-only: order */}
          {!isBlog && !isLegal && (
            <div className="space-y-1.5">
              <Label style={{ color: 'var(--color-text-secondary)' }}>Sorteringsrækkefølge</Label>
              <Input
                type="number"
                value={editing.order ?? 0}
                onChange={e => setEditing({ ...editing, order: Number(e.target.value) })}
                style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              />
            </div>
          )}

          {/* Legal-only: type */}
          {isLegal && (
            <div className="space-y-1.5">
              <Label style={{ color: 'var(--color-text-secondary)' }}>Type</Label>
              <select
                value={editing.type || 'faq'}
                onChange={e => setEditing({ ...editing, type: e.target.value })}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              >
                <option value="faq">FAQ</option>
                <option value="support">Support</option>
                <option value="privacy">Privatlivspolitik</option>
                <option value="terms">Handelsbetingelser</option>
              </select>
            </div>
          )}

          {/* Content — rich text editor */}
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Indhold</Label>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
              <ReactQuill
                theme="snow"
                value={editing.content || ''}
                onChange={val => setEditing(prev => ({ ...prev, content: val }))}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', { color: [] }],
                    [{ align: [] }],
                    ['link', 'image', 'video', { table: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                    ['clean'],
                  ],
                }}
                style={{ minHeight: '50vh', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {isSaving ? 'Gemmer...' : 'Gem indlæg'}
          </Button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────
  const items = activeTab === 'BlogPost' ? blogPosts : activeTab === 'KnowledgeArticle' ? articles : legalItems;
  const isLoading = activeTab === 'BlogPost' ? loadingBlogs : activeTab === 'KnowledgeArticle' ? loadingArticles : loadingLegal;

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <Link to={createPageUrl('Settings')}>
          <button className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </Link>
        <h1 className="flex-1 font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>Admin Editor</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          <Plus className="w-4 h-4" /> Ny
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={activeTab === tab
              ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }
              : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
          >
            {tab === 'BlogPost' ? <FileText className="w-3.5 h-3.5" /> : tab === 'KnowledgeArticle' ? <BookOpen className="w-3.5 h-3.5" /> : tab === 'LegalContent' ? <Scale className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
            {tab === 'BlogPost' ? 'Blog' : tab === 'KnowledgeArticle' ? 'Artikler' : tab === 'LegalContent' ? 'Juridisk' : 'Hjælp'}
          </button>
        ))}
      </div>

      {/* Help Modal Editor */}
      {activeTab === 'HelpModal' && (
        <div className="p-4 space-y-5 max-w-2xl mx-auto mt-2">
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Om appen (dansk)</Label>
            <textarea
              value={helpForm.help_about_text_da || ''}
              onChange={e => setHelpForm({ ...helpForm, help_about_text_da: e.target.value })}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Om appen (engelsk)</Label>
            <textarea
              value={helpForm.help_about_text_en || ''}
              onChange={e => setHelpForm({ ...helpForm, help_about_text_en: e.target.value })}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Kontakt e-mail</Label>
            <Input
              type="email"
              value={helpForm.help_contact_email || ''}
              onChange={e => setHelpForm({ ...helpForm, help_contact_email: e.target.value })}
              placeholder="hej@lalatoto.dk"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Telefonnummer</Label>
            <Input
              type="tel"
              value={helpForm.help_phone || ''}
              onChange={e => setHelpForm({ ...helpForm, help_phone: e.target.value })}
              placeholder="+45 12 34 56 78"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <Button onClick={handleSaveHelp} disabled={helpSaving} className="w-full"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {helpSaving ? 'Gemmer...' : 'Gem'}
          </Button>
        </div>
      )}

      {/* List */}
      <div className="p-4 space-y-2 mt-2">
        {activeTab === 'HelpModal' ? null : isLoading ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Indlæser...</p>
        ) : items.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen indlæg endnu</p>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-2xl border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {activeTab === 'LegalContent' ? (item.type || '—') : (item.category || '—')}
                  {activeTab === 'BlogPost' && (item.published ? ' · Publiceret' : ' · Skjult')}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                >
                  <Pencil className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: '#fee2e2' }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}