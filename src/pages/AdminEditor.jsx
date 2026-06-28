import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Plus, Pencil, Trash2, Eye, EyeOff, FileText, BookOpen, Upload, Bell, Scale, HelpCircle, Share2, Palette, Star, FlaskConical, MessageCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { clearSubscriptionCache } from '@/components/subscription/useSubscription';
import PushNotificationSender from '@/components/admin/PushNotificationSender';
import ColorThemeEditor from '@/components/admin/ColorThemeEditor';
import MilestoneFrameEditor from '@/components/admin/MilestoneFrameEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useLanguage } from '@/components/ui/LanguageContext';

const TABS = ['BlogPost', 'KnowledgeArticle', 'LegalContent', 'HelpModal', 'SharingPage', 'ColorTheme', 'Milestones', 'DemoMode', 'WonderWeeksIntro'];

const emptyBlog = { title: '', excerpt: '', content: '', category: '', featured_image: '', author_name: '', published: true, published_date: '' };
const emptyArticle = { title: '', content: '', category: '', tags: [], is_faq: false, order: 0 };
const emptyLegal = { type: 'faq', title: '', content: '' };

export default function AdminEditor() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('BlogPost');
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [helpConfig, setHelpConfig] = useState(null);
  const [helpForm, setHelpForm] = useState({});
  const [helpSaving, setHelpSaving] = useState(false);
  const [sharingConfig, setSharingConfig] = useState(null);
  const [sharingForm, setSharingForm] = useState({});
  const [sharingSaving, setShareSaving] = useState(false);
  const [demoConfig, setDemoConfig] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoSaving, setDemoSaving] = useState(false);
  const [wwIntroConfig, setWwIntroConfig] = useState(null);
  const [wwIntroForm, setWwIntroForm] = useState({});
  const [wwIntroSaving, setWwIntroSaving] = useState(false);


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
      toast.success(t.adminEditorSaved);
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
      toast.success(t.adminEditorSaved);
      setEditing(null);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminBlogPosts']); toast.success(t.adminEditorDeleted); },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id) => base44.entities.KnowledgeArticle.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminArticles']); toast.success(t.adminEditorDeleted); },
  });

  const saveLegalMutation = useMutation({
    mutationFn: async (data) => {
      if (isNew) return base44.entities.LegalContent.create(data);
      return base44.entities.LegalContent.update(editing.id, data);
    },
    onSuccess: () => { queryClient.invalidateQueries(['adminLegal']); toast.success(t.adminEditorSaved); setEditing(null); },
  });

  const deleteLegalMutation = useMutation({
    mutationFn: (id) => base44.entities.LegalContent.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminLegal']); toast.success(t.adminEditorDeleted); },
  });

  useEffect(() => {
    if (activeTab !== 'WonderWeeksIntro') return;
    base44.entities.AppConfig.filter({ key: 'wonderweeks_intro' }).then(results => {
      const config = results[0] || { key: 'wonderweeks_intro', title: '', body: '', footnote: '' };
      setWwIntroConfig(config);
      setWwIntroForm({ title: config.title || '', body: config.body || '', footnote: config.footnote || '' });
    });
  }, [activeTab]);

  const handleSaveWwIntro = async () => {
    setWwIntroSaving(true);
    if (wwIntroConfig?.id) {
      await base44.entities.AppConfig.update(wwIntroConfig.id, wwIntroForm);
    } else {
      const created = await base44.entities.AppConfig.create({ ...wwIntroForm, key: 'wonderweeks_intro' });
      setWwIntroConfig(created);
    }
    setWwIntroSaving(false);
    toast.success(t.adminEditorSaved);
  };

  useEffect(() => {
    if (activeTab !== 'DemoMode') return;
    base44.entities.AppConfig.filter({ key: 'main' }).then(results => {
      const config = results[0] || null;
      setDemoConfig(config);
      setDemoMode(config?.demo_mode === true);
    });
  }, [activeTab]);

  const handleToggleDemoMode = async (checked) => {
    setDemoSaving(true);
    setDemoMode(checked);
    if (demoConfig?.id) {
      await base44.entities.AppConfig.update(demoConfig.id, { demo_mode: checked });
    } else {
      const created = await base44.entities.AppConfig.create({ key: 'main', demo_mode: checked });
      setDemoConfig(created);
    }
    clearSubscriptionCache();
    setDemoSaving(false);
    toast.success(checked ? t.adminEditorDemoWarning : 'Demo-tilstand deaktiveret');
  };

  useEffect(() => {
    if (activeTab !== 'SharingPage') return;
    base44.entities.AppConfig.filter({ key: 'sharing_page' }).then(results => {
      const config = results[0] || { key: 'sharing_page', intro_text: '', invite_button_label: '' };
      setSharingConfig(config);
      setSharingForm({ ...config });
    });
  }, [activeTab]);

  const handleSaveSharing = async () => {
    setShareSaving(true);
    if (sharingConfig?.id) {
      await base44.entities.AppConfig.update(sharingConfig.id, sharingForm);
    } else {
      const created = await base44.entities.AppConfig.create({ ...sharingForm, key: 'sharing_page' });
      setSharingConfig(created);
    }
    setShareSaving(false);
    toast.success(t.adminEditorSaved);
  };

  const handleSaveHelp = async () => {
    setHelpSaving(true);
    if (helpConfig?.id) {
      await base44.entities.AppConfig.update(helpConfig.id, helpForm);
    } else {
      const created = await base44.entities.AppConfig.create({ ...helpForm, key: 'help_modal' });
      setHelpConfig(created);
    }
    setHelpSaving(false);
    toast.success(t.adminEditorSaved);
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
    if (!confirm(t.areYouSure)) return;
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
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => setEditing(null)} className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h1 className="flex-1 font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {isNew ? t.adminEditorNewPost : t.adminEditorEditPrefix} — {isBlog ? t.adminEditorBlog : isLegal ? t.adminEditorLegal : t.adminEditorArticle}
          </h1>
          <Button size="sm" onClick={handleSave} disabled={isSaving}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {isSaving ? t.adminEditorSaving : t.save}
          </Button>
        </div>

        <div className="p-4 space-y-5 max-w-2xl mx-auto">
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorTitleField}</Label>
            <Input
              value={editing.title || ''}
              onChange={e => setEditing({ ...editing, title: e.target.value })}
              placeholder="Titel..."
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>

          {isBlog && (
            <>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorExcerpt}</Label>
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
                <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorAuthor}</Label>
                <Input
                  value={editing.author_name || ''}
                  onChange={e => setEditing({ ...editing, author_name: e.target.value })}
                  placeholder="Navn..."
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorImage}</Label>
                {editing.featured_image && (
                  <img src={editing.featured_image} alt="preview" className="w-full h-40 object-cover rounded-xl" />
                )}
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm w-fit"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <Upload className="w-4 h-4" />
                  {uploading ? t.adminEditorUploading : t.adminEditorSelectImage}
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
                <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorPublishDate}</Label>
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
                  {editing.published ? t.adminEditorPublished : t.adminEditorHidden}
                </button>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorCategory}</Label>
            <Input
              value={editing.category || ''}
              onChange={e => setEditing({ ...editing, category: e.target.value })}
              placeholder="Kategori..."
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>

          {!isBlog && !isLegal && (
            <>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorTags}</Label>
                <Input
                  value={(editing.tags || []).join(', ')}
                  onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="tigerspring-1, søvn, baby"
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  For at artiklen vises under Tigerspring nr. 1 skal den have tagget <code>tigerspring-1</code> (nr. 1–10).
                </p>
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorExcerptArticle}</Label>
                <textarea
                  value={editing.excerpt || ''}
                  onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Kort beskrivelse der vises i tigerspring-listen..."
                  rows={2}
                  className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorOrder}</Label>
                <Input
                  type="number"
                  value={editing.order ?? 0}
                  onChange={e => setEditing({ ...editing, order: Number(e.target.value) })}
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
              </div>
            </>
          )}

          {isLegal && (
            <div className="space-y-1.5">
              <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorType}</Label>
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

          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorContent}</Label>
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
                    ['link', 'image', 'video'],
                    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                    ['clean'],
                  ],
                  clipboard: {
                    matchVisual: false,
                  },
                }}
                style={{ minHeight: '50vh', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {isSaving ? t.adminEditorSaving : t.adminEditorSavePost}
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
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <Link to="/Settings">
          <button className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </Link>
        <h1 className="flex-1 font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>{t.adminEditorTitle}</h1>
        <Link to="/AdminSupport">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>
            <MessageCircle className="w-3.5 h-3.5" /> {t.adminEditorSupportBtn}
          </button>
        </Link>
        <Link to="/AdminNotifications">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>
            <Bell className="w-3.5 h-3.5" /> {t.adminEditorNotificationsBtn}
          </button>
        </Link>
        {activeTab !== 'HelpModal' && activeTab !== 'SharingPage' && activeTab !== 'ColorTheme' && activeTab !== 'Milestones' && activeTab !== 'DemoMode' && activeTab !== 'WonderWeeksIntro' && (
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <Plus className="w-4 h-4" /> {t.adminEditorNewBtn}
          </button>
        )}
      </div>

      <div className="flex gap-2 px-4 pt-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
            style={activeTab === tab
              ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }
              : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
          >
            {tab === 'BlogPost' ? <FileText className="w-3.5 h-3.5" /> : tab === 'KnowledgeArticle' ? <BookOpen className="w-3.5 h-3.5" /> : tab === 'LegalContent' ? <Scale className="w-3.5 h-3.5" /> : tab === 'HelpModal' ? <HelpCircle className="w-3.5 h-3.5" /> : tab === 'SharingPage' ? <Share2 className="w-3.5 h-3.5" /> : tab === 'ColorTheme' ? <Palette className="w-3.5 h-3.5" /> : tab === 'Milestones' ? <Star className="w-3.5 h-3.5" /> : <FlaskConical className="w-3.5 h-3.5" />}
            {tab === 'BlogPost' ? t.adminEditorBlogTab : tab === 'KnowledgeArticle' ? t.adminEditorArticlesTab : tab === 'LegalContent' ? t.adminEditorLegalTab : tab === 'HelpModal' ? t.adminEditorHelpTab : tab === 'SharingPage' ? t.adminEditorSharingTab : tab === 'ColorTheme' ? t.adminEditorColorTab : tab === 'Milestones' ? t.adminEditorMilestonesTab : tab === 'DemoMode' ? t.adminEditorDemoTab : t.adminEditorWonderWeeksTab}
          </button>
        ))}
      </div>

      {activeTab === 'SharingPage' && (
        <div className="p-4 space-y-5 max-w-2xl mx-auto mt-2">
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorSharingIntro}</Label>
            <textarea
              value={sharingForm.intro_text || ''}
              onChange={e => setSharingForm({ ...sharingForm, intro_text: e.target.value })}
              rows={4}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              placeholder="Invitér et familiemedlem til at følge med..."
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorSharingButton}</Label>
            <Input
              value={sharingForm.invite_button_label || ''}
              onChange={e => setSharingForm({ ...sharingForm, invite_button_label: e.target.value })}
              placeholder="Invitér familiemedlem"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <Button onClick={handleSaveSharing} disabled={sharingSaving} className="w-full"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {sharingSaving ? t.adminEditorSaving : t.save}
          </Button>
        </div>
      )}

      {activeTab === 'HelpModal' && (
        <div className="p-4 space-y-5 max-w-2xl mx-auto mt-2">
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorHelpAboutDa}</Label>
            <textarea
              value={helpForm.help_about_text_da || ''}
              onChange={e => setHelpForm({ ...helpForm, help_about_text_da: e.target.value })}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorHelpAboutEn}</Label>
            <textarea
              value={helpForm.help_about_text_en || ''}
              onChange={e => setHelpForm({ ...helpForm, help_about_text_en: e.target.value })}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorHelpContact}</Label>
            <Input
              type="email"
              value={helpForm.help_contact_email || ''}
              onChange={e => setHelpForm({ ...helpForm, help_contact_email: e.target.value })}
              placeholder="hej@lalatoto.dk"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorHelpPhone}</Label>
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
            {helpSaving ? t.adminEditorSaving : t.save}
          </Button>
        </div>
      )}


      {activeTab === 'WonderWeeksIntro' && (
        <div className="p-4 space-y-5 max-w-2xl mx-auto mt-2">
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorWwTitle}</Label>
            <Input
              value={wwIntroForm.title || ''}
              onChange={e => setWwIntroForm({ ...wwIntroForm, title: e.target.value })}
              placeholder="Tigerspring"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorWwBody}</Label>
            <textarea
              value={wwIntroForm.body || ''}
              onChange={e => setWwIntroForm({ ...wwIntroForm, body: e.target.value })}
              rows={4}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              placeholder="Tigerspring er perioder, hvor dit barn..."
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminEditorWwFootnote}</Label>
            <textarea
              value={wwIntroForm.footnote || ''}
              onChange={e => setWwIntroForm({ ...wwIntroForm, footnote: e.target.value })}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              placeholder="Ugerne er vejledende og regnes fra terminsdato..."
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <Button onClick={handleSaveWwIntro} disabled={wwIntroSaving} className="w-full"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {wwIntroSaving ? t.adminEditorSaving : t.save}
          </Button>
        </div>
      )}

      {activeTab === 'ColorTheme' && <ColorThemeEditor />}
      {activeTab === 'Milestones' && <MilestoneFrameEditor />}

      {activeTab === 'DemoMode' && (
        <div className="p-4 max-w-lg mx-auto mt-4 space-y-4">
          <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: demoMode ? '#fef3c7' : 'var(--color-bg-subtle)' }}>
                <FlaskConical className="w-5 h-5" style={{ color: demoMode ? '#d97706' : 'var(--color-text-muted)' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.adminEditorDemoMode}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.adminEditorDemoDesc}</p>
              </div>
              <Switch checked={demoMode} onCheckedChange={handleToggleDemoMode} disabled={demoSaving} />
            </div>
            {demoMode && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                {t.adminEditorDemoWarning}
              </div>
            )}
            {!demoMode && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t.adminEditorDemoUsedFor}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-4 space-y-2 mt-2">
        {activeTab === 'HelpModal' || activeTab === 'SharingPage' || activeTab === 'ColorTheme' || activeTab === 'Milestones' || activeTab === 'DemoMode' || activeTab === 'WonderWeeksIntro' ? null : isLoading ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.adminEditorLoading}</p>
        ) : items.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.adminEditorNoPostsYet}</p>
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
                  {activeTab === 'BlogPost' && (item.published ? ` · ${t.adminEditorPublished}` : ` · ${t.adminEditorHidden}`)}
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