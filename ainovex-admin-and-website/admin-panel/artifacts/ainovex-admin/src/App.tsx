import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Activity, AlertCircle, ArrowUpRight, BookOpen, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Clock3, ExternalLink, FileText, FolderOpen,
  GitBranch, Github, Globe2, LayoutDashboard, LoaderCircle, LockKeyhole, LogOut, Menu,
  MoreHorizontal, Plus, Rocket, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles,
  Tag, Trash2, X,
} from 'lucide-react';
import {
  useGetAdminSession, getGetAdminSessionQueryKey,
  useGetAdminOverview, getGetAdminOverviewQueryKey,
  useGetGitHubSettings, getGetGitHubSettingsQueryKey, useSaveGitHubSettings,
  useListArticles, getListArticlesQueryKey, useCreateArticle, useUpdateArticle, useRequestArticleDeletion,
  useListCategories, getListCategoriesQueryKey, useCreateCategory, useUpdateCategory, useRequestCategoryDeletion,
  useGetSiteConfig, getGetSiteConfigQueryKey, useSaveSiteConfig,
  useListPublishingHistory, getListPublishingHistoryQueryKey, useCreatePublishPreview,
  useConfirmPublish, useCancelPublishPreview,
} from '@workspace/api-client-react';
import type { Article, Category, PublishKind, PublishPreview, SiteConfigInput } from '@workspace/api-client-react';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { gcTime: 0 },
  },
});
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}
if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#b78335', colorForeground: '#26313b', colorMutedForeground: '#74808a',
    colorDanger: '#a74138', colorBackground: '#fbfaf7', colorInput: '#f7f4ee',
    colorInputForeground: '#26313b', colorNeutral: '#ded9cf', fontFamily: 'DM Sans',
    borderRadius: '0.7rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fbfaf7] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#e5dfd4]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#26313b] font-semibold',
    headerSubtitle: 'text-[#687580]',
    socialButtonsBlockButtonText: 'text-[#26313b]',
    formFieldLabel: 'text-[#35414b]',
    footerActionLink: 'text-[#9a6927]',
    footerActionText: 'text-[#69747d]',
    dividerText: 'text-[#77818a]',
    identityPreviewEditButton: 'text-[#9a6927]',
    formFieldSuccessText: 'text-[#386959]',
    alertText: 'text-[#8e3933]',
    logoBox: 'rounded-lg',
    logoImage: 'rounded-md',
    socialButtonsBlockButton: 'border-[#ded9cf] bg-[#fffefa]',
    formButtonPrimary: 'bg-[#293641] hover:bg-[#1e2932] text-[#fffdf7]',
    formFieldInput: 'border-[#ded9cf] bg-[#fffefa] text-[#26313b]',
    footerAction: 'text-[#69747d]',
    dividerLine: 'bg-[#e4ded4]',
    alert: 'border-[#e2b4ad] bg-[#fbefed]',
    otpCodeFieldInput: 'border-[#ded9cf] bg-[#fffefa]',
    formFieldRow: 'text-[#26313b]',
    main: 'text-[#26313b]',
  },
};

type IconType = typeof LayoutDashboard;
const navItems: { href: string; label: string; icon: IconType }[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/publishing', label: 'Publishing', icon: Rocket },
  { href: '/settings', label: 'Settings', icon: Settings2 },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand-lockup ${compact ? 'brand-compact' : ''}`}><span className="brand-symbol">A</span><span><strong>AINOVEX</strong><small>EDITORIAL CONTROL</small></span></div>;
}

function Home() {
  const { isSignedIn, isLoaded } = useUser();
  if (isLoaded && isSignedIn) return <Redirect to="/dashboard" />;
  return <main className="welcome-screen">
    <section className="welcome-panel">
      <div className="welcome-top"><Brand /><div className="secure-mark"><LockKeyhole size={14} /> PRIVATE WORKSPACE</div></div>
      <div className="welcome-content">
        <div className="eyebrow"><span className="live-dot" /> EDITORIAL OPERATIONS <span className="eyebrow-line" /></div>
        <h1>Review with care.<br /><em>Publish with confidence.</em></h1>
        <p className="welcome-copy">A secure control room for source-backed content and deliberate releases to the AINOVEX repository.</p>
        <Link href="/sign-in" className="button button-primary welcome-cta" data-testid="link-sign-in">Continue to sign in <ChevronRight size={17} /></Link>
        <div className="welcome-assurance"><ShieldCheck size={16} /> Every change is reviewed before it reaches production.</div>
      </div>
      <div className="welcome-bottom"><span>AINOVEX ADMIN / 01</span><span>CONTROLLED ACCESS</span></div>
    </section>
    <aside className="welcome-aside"><div className="aside-orbit orbit-a" /><div className="aside-orbit orbit-b" />
       <div className="aside-caption">RELEASE CONTROL / TWO-STEP</div>
       <div className="release-graphic"><div className="graphic-index">01 — 04</div><div className="graphic-stack"><span /><span /><span /></div><div className="graphic-commit"><GitBranch size={17} /><span><b>reviewed change</b><small>preview · confirm</small></span><CheckCircle2 size={19} className="commit-check" /></div></div>
      <div className="aside-note"><strong>Quietly exact.</strong><br />Credentials are fresh for every publish. Changes are visible before they are committed.</div>
       <div className="aside-coordinate">REVIEW → CONFIRM → COMMIT</div>
    </aside>
  </main>;
}

function SignInPage() {
  return <div className="auth-screen"><div className="auth-brand"><Brand /></div><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}
function SignUpPage() {
  return <div className="auth-screen"><div className="auth-brand"><Brand /></div><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
}

function AdminGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const [, setLocation] = useLocation();
  const session = useGetAdminSession({ query: { enabled: isLoaded && !!isSignedIn, queryKey: getGetAdminSessionQueryKey() } });
  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation('/');
  }, [isLoaded, isSignedIn, setLocation]);
  if (!isLoaded || (isSignedIn && session.isLoading)) return <div className="gate-loading"><div className="gate-mark"><LoaderCircle size={18} /></div><span>Verifying administrator access</span><div className="skeleton-bar" /></div>;
  if (!isSignedIn) return <div className="gate-loading"><div className="gate-mark"><LockKeyhole size={18} /></div><span>Returning to secure entry</span></div>;
  if (session.isError) {
    const status = (session.error as { status?: number })?.status;
    const forbidden = status === 403 || (session.error as { response?: { status?: number } })?.response?.status === 403;
    return <div className="access-denied"><Brand /><div className="access-icon"><AlertCircle size={23} /></div><h1>{forbidden ? 'Administrator access required' : 'Session could not be verified'}</h1><p>{forbidden ? 'This signed-in account is not authorized to manage AINOVEX publishing.' : 'Your secure session could not be confirmed. Please sign in again or retry.'}</p><button className="button button-primary" onClick={() => forbidden ? setLocation('/') : session.refetch()} data-testid="button-access-retry">{forbidden ? 'Return to sign in' : 'Retry session check'}</button></div>;
  }
  return <>{children}</>;
}

function Shell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow: string }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-shade" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand compact /></div>
      <div className="workspace-label">WORKSPACE <span>ADMIN</span></div>
      <nav className="sidebar-nav">{navItems.map(({ href, label, icon: Icon }, i) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`nav-link ${location === href ? 'nav-active' : ''}`} data-testid={`link-nav-${label.toLowerCase()}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{i === 0 && <span className="nav-index">01</span>}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-status"><span className="live-dot" /><span><b>SECURE SESSION</b><small>Cookie-authenticated</small></span></div><button className="profile-button" onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-sign-out"><span className="avatar-initial">{(user?.firstName || user?.primaryEmailAddress?.emailAddress || 'A').slice(0, 1).toUpperCase()}</span><span className="profile-name">{user?.firstName || user?.primaryEmailAddress?.emailAddress || 'Administrator'}<small>Administrator</small></span><LogOut size={15} /></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={20} /></button><div className="breadcrumb"><span>AINOVEX</span><ChevronRight size={13} /><span>{eyebrow}</span></div><div className="topbar-right"><span className="topbar-time"><span className="live-dot" /> ADMIN CONSOLE</span><span className="topbar-separator" /><span className="help-button" aria-label="Help" title="Publishing changes are explicit and reviewed"><CircleHelp size={17} /></span></div></header>
      <div className="page-wrap"><div className="page-heading"><div><div className="page-kicker">{eyebrow}</div><h1>{title}</h1></div><div className="page-heading-meta"><span className="status-pill"><span className="live-dot" /> PRIVATE / ACTIVE</span><span className="mono-label">AINO–OPS</span></div></div>{children}<footer className="page-footer"><span>AINOVEX PUBLISHING ADMIN</span><span>Changes remain drafts until explicitly published.</span></footer></div>
    </main>
  </div>;
}

function Panel({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) { return <section className={`panel ${className}`} id={id}>{children}</section>; }
function PanelTitle({ kicker, title, trailing }: { kicker?: string; title: string; trailing?: ReactNode }) { return <div className="panel-title"><div>{kicker && <div className="panel-kicker">{kicker}</div>}<h2>{title}</h2></div>{trailing}</div>; }
function QueryError({ retry }: { retry: () => void }) { return <div className="query-error"><AlertCircle size={18} /><span>Could not load this data.</span><button onClick={retry} className="text-button" data-testid="button-retry">Retry</button></div>; }
function LoadingRows() { return <div className="loading-rows"><div /><div /><div /></div>; }
function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) { return <span className={`status-badge badge-${tone}`}><span className="badge-dot" />{children}</span>; }
function PageFrame({ path, title, eyebrow, children }: { path: string; title: string; eyebrow: string; children: ReactNode }) { return <AdminGate><Shell title={title} eyebrow={eyebrow}><div data-route={path}>{children}</div></Shell></AdminGate>; }

function Dashboard() {
  const overview = useGetAdminOverview();
  const data = overview.data;
  return <PageFrame path="/dashboard" eyebrow="CONTROL ROOM / 01" title="Good work starts with a clear view.">
    {overview.isLoading ? <div className="dashboard-skeleton"><div /><div /><div /></div> : overview.isError ? <Panel><QueryError retry={() => overview.refetch()} /></Panel> : <>
      <section className="overview-banner"><div className="banner-copy"><span className="banner-label"><Sparkles size={14} /> EDITORIAL STATUS</span><h2>{data?.articleDraftCount || data?.categoryDraftCount || data?.siteConfigDraft ? 'Your changes are waiting for review.' : 'Everything is in its considered place.'}</h2><p>Nothing goes live until you inspect the change set and confirm the commit.</p><Link href="/publishing" className="button button-light" data-testid="link-review-publishing">Review publishing queue <ArrowUpRight size={15} /></Link></div><div className="banner-stamp"><div className="stamp-circle"><span>AINO</span><strong>01</strong><span>CONTROL</span></div><span>OWNER-OPERATED<br />PUBLISH PIPELINE</span></div><div className="banner-orbit" /></section>
      <div className="metric-grid">
        <Panel className="metric-panel"><div className="metric-top"><span>ARTICLE LIBRARY</span><BookOpen size={16} /></div><strong>{data?.articleCount ?? '—'}</strong><div className="metric-bottom"><span>{data?.articleDraftCount ?? 0} require review</span><Link href="/articles">Open library <ArrowUpRight size={13} /></Link></div></Panel>
        <Panel className="metric-panel"><div className="metric-top"><span>CATEGORIES</span><Tag size={16} /></div><strong>{data?.categoryCount ?? '—'}</strong><div className="metric-bottom"><span>{data?.categoryDraftCount ?? 0} with draft changes</span><Link href="/categories">Manage categories <ArrowUpRight size={13} /></Link></div></Panel>
        <Panel className="metric-panel metric-repo"><div className="metric-top"><span>REPOSITORY</span><Github size={16} /></div><strong className="metric-word">{data?.repositoryConfigured ? 'Connected' : 'Not configured'}</strong><div className="metric-bottom"><span><span className={`mini-dot ${data?.repositoryConfigured ? 'mini-good' : ''}`} />{data?.repositoryConfigured ? 'Target repository ready' : 'Set a publishing target'}</span><Link href="/settings">Repository settings <ArrowUpRight size={13} /></Link></div></Panel>
      </div>
      <div className="dashboard-columns">
        <Panel className="activity-panel"><PanelTitle kicker="RECENT ACTIVITY" title="Publishing ledger" trailing={<Link href="/publishing" className="quiet-link">Full history <ArrowUpRight size={14} /></Link>} />
          {(data?.recentPublishing?.length ?? 0) === 0 ? <div className="empty-state"><div className="empty-icon"><GitBranch size={19} /></div><strong>No commits recorded yet</strong><p>Confirmed publications appear here with their repository status.</p></div> : <div className="activity-list">{data?.recentPublishing.map((entry) => <div className="activity-row" key={entry.id} data-testid={`activity-row-${entry.id}`}><div className="activity-symbol"><GitBranch size={15} /></div><div className="activity-main"><strong>{entry.path.split('/').pop()}</strong><span>{entry.kind} · {entry.action} · {entry.branch}</span></div><span className={`history-state state-${entry.deploymentStatus}`}>{entry.deploymentStatus.replaceAll('_', ' ')}</span><time>{formatDate(entry.createdAt)}</time></div>)}</div>}
        </Panel>
        <Panel className="checklist-panel"><PanelTitle kicker="RELEASE READINESS" title="Before you publish" /><div className="readiness-list"><div><span className={`readiness-icon ${data?.repositoryConfigured ? 'ready' : ''}`}>{data?.repositoryConfigured ? <Check size={13} /> : <span>01</span>}</span><span><b>Repository target</b><small>{data?.repositoryConfigured ? 'Configured and ready' : 'Set owner, repository and branch'}</small></span>{!data?.repositoryConfigured && <Link href="/settings" aria-label="Set up repository"><ChevronRight size={16} /></Link>}</div><div><span className={`readiness-icon ${!data?.articleDraftCount && !data?.categoryDraftCount && !data?.siteConfigDraft ? 'ready' : ''}`}>{!data?.articleDraftCount && !data?.categoryDraftCount && !data?.siteConfigDraft ? <Check size={13} /> : <span>02</span>}</span><span><b>Review pending changes</b><small>{(data?.articleDraftCount ?? 0) + (data?.categoryDraftCount ?? 0) + Number(data?.siteConfigDraft ?? false)} changes in draft</small></span><Link href="/publishing" aria-label="Review changes"><ChevronRight size={16} /></Link></div><div><span className="readiness-icon ready"><ShieldCheck size={14} /></span><span><b>Fresh credentials</b><small>Requested only when preparing a preview</small></span></div></div><div className="readiness-note"><LockKeyhole size={14} /> GitHub credentials are never saved by this console.</div></Panel>
      </div>
    </>}
  </PageFrame>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-scrim" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><div className="panel-kicker">EDITORIAL RECORD</div><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>{children}</section></div>;
}

function Articles() {
  const query = useListArticles();
  const categoriesQ = useListCategories();
  const qc = useQueryClient();
  const create = useCreateArticle();
  const update = useUpdateArticle();
  const remove = useRequestArticleDeletion();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Article | null | 'new'>(null);
  const [confirmDelete, setConfirmDelete] = useState<Article | null>(null);
  const [formError, setFormError] = useState('');
  const save = (form: FormData) => {
    const title = String(form.get('title') || '').trim();
    const body = String(form.get('body') || '').trim();
    const description = String(form.get('description') || '').trim();
    const slug = String(form.get('slug') || '').trim();
    const category = String(form.get('category') || '');
    if (!title || !body || !description || !category || (!editing || editing === 'new') && !slug) { setFormError('Complete the required fields before saving.'); return; }
    setFormError('');
    const input = {
      title, body, description, category,
      date: String(form.get('date') || new Date().toISOString().slice(0, 10)),
      author: String(form.get('author') || ''),
      primaryKeyword: String(form.get('primaryKeyword') || ''),
      image: String(form.get('image') || ''), imageAlt: String(form.get('imageAlt') || ''),
      featured: form.get('featured') === 'on', cornerstone: form.get('cornerstone') === 'on',
      faq: form.get('faq') === 'on', related: [],
    };
    if (!editing || editing === 'new') create.mutate({ data: { ...input, slug } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListArticlesQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() }); setEditing(null); } });
    else update.mutate({ id: editing.id, data: input }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListArticlesQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() }); setEditing(null); } });
  };
  const articles = (query.data ?? []).filter((a) => `${a.title} ${a.category} ${a.slug}`.toLowerCase().includes(search.toLowerCase()));
  return <PageFrame path="/articles" eyebrow="CONTENT / 02" title="Articles">
    <div className="toolbar"><div><p className="page-intro">A source-backed library of editorial drafts and published snapshots.</p></div><button className="button button-primary" onClick={() => { setEditing('new'); setFormError(''); }} data-testid="button-create-article"><Plus size={16} /> New article</button></div>
    <Panel className="table-panel"><div className="table-toolbar"><div className="table-label"><span>ARTICLE RECORDS</span><span className="count-chip">{query.data?.length ?? '—'}</span></div><label className="search-field"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records" aria-label="Search articles" data-testid="input-search-articles" /></label><span className="filter-button" title="Showing all records"><SlidersHorizontal size={15} /> All records <ChevronDown size={13} /></span></div>
      {query.isLoading ? <LoadingRows /> : query.isError ? <QueryError retry={() => query.refetch()} /> : articles.length === 0 ? <div className="empty-state table-empty"><div className="empty-icon"><FileText size={19} /></div><strong>{search ? 'No matching articles' : 'The library is ready for its first draft'}</strong><p>{search ? 'Try another title, category, or slug.' : 'Create a draft here. It remains private until its reviewed changes are published.'}</p>{!search && <button className="button button-outline" onClick={() => setEditing('new')}><Plus size={15} /> Create an article</button>}</div> :
      <div className="table-scroll"><table><thead><tr><th>TITLE / SLUG</th><th>CATEGORY</th><th>STATUS</th><th>LAST UPDATED</th><th /></tr></thead><tbody>{articles.map((article) => <tr key={article.id} data-testid={`row-article-${article.id}`}><td><div className="record-cell"><span className="record-icon"><FileText size={15} /></span><span><strong>{article.title}</strong><small>/{article.slug}</small></span></div></td><td><span className="category-chip">{article.category}</span></td><td><StatusBadge tone={article.deleteRequested ? 'danger' : article.isDirty ? 'draft' : article.isPublished ? 'published' : 'neutral'}>{article.deleteRequested ? 'Deletion pending' : article.isDirty ? 'Draft changes' : article.isPublished ? 'Published' : 'Draft'}</StatusBadge></td><td className="date-cell">{formatDate(article.updated || article.date)}</td><td><div className="row-actions"><button className="text-button" onClick={() => { setEditing(article); setFormError(''); }} data-testid={`button-edit-article-${article.id}`}>Edit</button><button className="icon-button row-more" onClick={() => setConfirmDelete(article)} aria-label={`Delete ${article.title}`} data-testid={`button-delete-article-${article.id}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
    </Panel>
    {editing !== null && <Modal title={editing === 'new' ? 'Create article draft' : 'Edit article draft'} onClose={() => setEditing(null)}><form className="form-stack" onSubmit={(e) => { e.preventDefault(); save(new FormData(e.currentTarget)); }}><div className="field-pair"><label className="field"><span>Title <b>*</b></span><input name="title" required defaultValue={editing === 'new' ? '' : editing.title} placeholder="A precise, descriptive headline" data-testid="input-article-title" /></label><label className="field"><span>Slug {editing === 'new' && <b>*</b>}</span><input name="slug" disabled={editing !== 'new'} required={editing === 'new'} defaultValue={editing === 'new' ? '' : editing.slug} placeholder="article-url-slug" data-testid="input-article-slug" /></label></div><label className="field"><span>Summary <b>*</b></span><textarea name="description" required defaultValue={editing === 'new' ? '' : editing.description} rows={2} placeholder="What should a reader take away?" data-testid="input-article-description" /></label><div className="field-pair"><label className="field"><span>Category <b>*</b></span><select name="category" required defaultValue={editing === 'new' ? '' : editing.category} data-testid="select-article-category"><option value="" disabled>Select a category</option>{categoriesQ.data?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></label><label className="field"><span>Author</span><input name="author" defaultValue={editing === 'new' ? '' : editing.author} placeholder="Editorial team" /></label></div><label className="field"><span>Article body <b>*</b></span><textarea name="body" required defaultValue={editing === 'new' ? '' : editing.body} rows={8} placeholder="Write the reviewed source-backed content…" data-testid="input-article-body" /></label><div className="field-pair"><label className="field"><span>Publish date</span><input name="date" type="date" defaultValue={editing === 'new' ? new Date().toISOString().slice(0, 10) : editing.date?.slice(0, 10)} /></label><label className="field"><span>Primary keyword</span><input name="primaryKeyword" defaultValue={editing === 'new' ? '' : editing.primaryKeyword} /></label></div><details className="advanced-fields"><summary>Additional frontmatter <ChevronDown size={14} /></summary><div className="field-pair"><label className="field"><span>Image URL</span><input name="image" defaultValue={editing === 'new' ? '' : editing.image} /></label><label className="field"><span>Image description</span><input name="imageAlt" defaultValue={editing === 'new' ? '' : editing.imageAlt} /></label></div><div className="check-row"><label><input type="checkbox" name="featured" defaultChecked={editing !== 'new' && editing.featured} /> Featured</label><label><input type="checkbox" name="cornerstone" defaultChecked={editing !== 'new' && editing.cornerstone} /> Cornerstone</label><label><input type="checkbox" name="faq" defaultChecked={editing !== 'new' && editing.faq} /> FAQ content</label></div></details>{formError && <div className="inline-error"><AlertCircle size={15} />{formError}</div>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setEditing(null)}>Cancel</button><button className="button button-primary" disabled={create.isPending || update.isPending} data-testid="button-save-article">{create.isPending || update.isPending ? 'Saving…' : 'Save draft'} <ArrowUpRight size={14} /></button></div></form></Modal>}
    {confirmDelete && <Modal title="Request article deletion" onClose={() => setConfirmDelete(null)}><p className="confirm-copy">Remove <strong>{confirmDelete.title}</strong> from the editorial library? Published content will be marked for deletion and still requires an explicit publish.</p><div className="modal-actions"><button className="button button-quiet" onClick={() => setConfirmDelete(null)}>Keep article</button><button className="button button-danger" onClick={() => remove.mutate({ id: confirmDelete.id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListArticlesQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() }); setConfirmDelete(null); } })} disabled={remove.isPending} data-testid="button-confirm-delete-article">{remove.isPending ? 'Requesting…' : 'Request deletion'}</button></div></Modal>}
  </PageFrame>;
}

function Categories() {
  const query = useListCategories();
  const qc = useQueryClient();
  const create = useCreateCategory(); const update = useUpdateCategory(); const remove = useRequestCategoryDeletion();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [error, setError] = useState('');
  function save(fd: FormData) {
    const name = String(fd.get('name') || '').trim(), intro = String(fd.get('intro') || '').trim();
    const slug = String(fd.get('slug') || '').trim();
    if (!name || !intro || (!editing || editing === 'new') && !slug) { setError('Complete all required fields.'); return; }
    const done = () => { qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() }); setEditing(null); };
    if (editing === 'new') create.mutate({ data: { slug, name, intro } }, { onSuccess: done });
    else if (editing) update.mutate({ id: editing.id, data: { name, intro } }, { onSuccess: done });
  }
  return <PageFrame path="/categories" eyebrow="CONTENT / 03" title="Categories">
    <div className="toolbar"><p className="page-intro">Keep the taxonomy coherent. Category changes are drafts until published.</p><button className="button button-primary" onClick={() => { setEditing('new'); setError(''); }} data-testid="button-create-category"><Plus size={16} /> New category</button></div>
    <div className="category-grid">{query.isLoading ? <Panel><LoadingRows /></Panel> : query.isError ? <Panel><QueryError retry={() => query.refetch()} /></Panel> : query.data?.length === 0 ? <Panel className="category-empty"><div className="empty-icon"><FolderOpen size={19} /></div><strong>No categories yet</strong><p>Start with a clear taxonomy for your editorial library.</p><button className="button button-outline" onClick={() => setEditing('new')}><Plus size={15} /> Add category</button></Panel> : query.data?.map((category) => <Panel className="category-card" key={category.id} data-testid={`card-category-${category.id}`}><div className="category-card-top"><span className="category-mark"><Tag size={16} /></span><button className="icon-button" onClick={() => setDeleting(category)} aria-label={`Delete ${category.name}`} data-testid={`button-delete-category-${category.id}`}><MoreHorizontal size={17} /></button></div><span className="category-slug">/{category.slug}</span><h2>{category.name}</h2><p>{category.intro}</p><div className="category-card-bottom"><StatusBadge tone={category.deleteRequested ? 'danger' : category.isDirty ? 'draft' : category.isPublished ? 'published' : 'neutral'}>{category.deleteRequested ? 'Deletion pending' : category.isDirty ? 'Draft changes' : category.isPublished ? 'Published' : 'Draft'}</StatusBadge><button className="text-button" onClick={() => { setEditing(category); setError(''); }} data-testid={`button-edit-category-${category.id}`}>Edit <ArrowUpRight size={13} /></button></div></Panel>)}</div>
    {editing && <Modal title={editing === 'new' ? 'Create category' : 'Edit category'} onClose={() => setEditing(null)}><form className="form-stack" onSubmit={(e) => { e.preventDefault(); save(new FormData(e.currentTarget)); }}><label className="field"><span>Name <b>*</b></span><input name="name" required defaultValue={editing === 'new' ? '' : editing.name} placeholder="Research notes" /></label><label className="field"><span>Slug {editing === 'new' && <b>*</b>}</span><input name="slug" required={editing === 'new'} disabled={editing !== 'new'} defaultValue={editing === 'new' ? '' : editing.slug} placeholder="research-notes" /></label><label className="field"><span>Introduction <b>*</b></span><textarea name="intro" required rows={4} defaultValue={editing === 'new' ? '' : editing.intro} placeholder="A short introduction to this collection." /></label>{error && <div className="inline-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setEditing(null)}>Cancel</button><button className="button button-primary" disabled={create.isPending || update.isPending} data-testid="button-save-category">{create.isPending || update.isPending ? 'Saving…' : 'Save category'}</button></div></form></Modal>}
    {deleting && <Modal title="Request category deletion" onClose={() => setDeleting(null)}><p className="confirm-copy">Request deletion of <strong>{deleting.name}</strong>? Published categories may have article references and will only be removed from the repository after explicit publish.</p><div className="modal-actions"><button className="button button-quiet" onClick={() => setDeleting(null)}>Keep category</button><button className="button button-danger" onClick={() => remove.mutate({ id: deleting.id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() }); setDeleting(null); } })} disabled={remove.isPending}>Request deletion</button></div></Modal>}
  </PageFrame>;
}

function Publishing() {
  const articles = useListArticles(); const categories = useListCategories();
  const history = useListPublishingHistory(); const qc = useQueryClient();
  const createPreview = useCreatePublishPreview(); const confirm = useConfirmPublish(); const cancel = useCancelPublishPreview();
  const [kind, setKind] = useState<PublishKind>('article');
  const [resourceId, setResourceId] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [preview, setPreview] = useState<PublishPreview | null>(null);
  const [message, setMessage] = useState('');
  const [showResult, setShowResult] = useState<{ headline: string; detail: string } | null>(null);
  const resourceOptions = kind === 'article' ? (articles.data ?? []).filter((a) => a.isDirty || a.deleteRequested || !a.isPublished) : kind === 'category' ? (categories.data ?? []).filter((c) => c.isDirty || c.deleteRequested || !c.isPublished) : [];
  useEffect(() => { setResourceId(''); }, [kind]);
  function requestPreview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim() || !token) return;
    const credentials = { username: username.trim(), personalAccessToken: token };
    const body = { kind, resourceId: kind === 'article' || kind === 'category' ? resourceId || null : null, ...credentials };
    setUsername(''); setToken('');
    createPreview.mutate({ data: body }, {
      onSuccess: (res) => { setPreview(res); setShowResult(null); },
      onError: (error) => { setShowResult({ headline: 'Preview could not be prepared', detail: errorMessage(error) }); },
      onSettled: () => createPreview.reset(),
    });
  }
  function discardPreview() {
    if (!preview) return;
    cancel.mutate({ previewId: preview.previewId }, { onSuccess: () => { setPreview(null); setShowResult({ headline: 'Preview cancelled', detail: 'The prepared changes were discarded. Credentials have been cleared.' }); }, onError: (e) => setShowResult({ headline: 'Could not cancel preview', detail: errorMessage(e) }) });
  }
  function confirmChanges() {
    if (!preview) return;
    confirm.mutate({ previewId: preview.previewId }, { onSuccess: (result) => {
      setShowResult({ headline: 'Changes committed to GitHub', detail: `GitHub: ${result.githubStatus} · ${result.commitSha.slice(0, 7)} · ${result.message}` });
      setPreview(null);
      [getListArticlesQueryKey(), getListCategoriesQueryKey(), getGetAdminOverviewQueryKey(), getListPublishingHistoryQueryKey()].forEach((queryKey) => qc.invalidateQueries({ queryKey }));
    }, onError: (e) => { setPreview(null); setShowResult({ headline: 'Commit was not completed', detail: errorMessage(e) }); } });
  }
  const expiry = preview ? new Date(preview.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  return <PageFrame path="/publishing" eyebrow="RELEASES / 04" title="Publishing">
    <p className="page-intro">A deliberate, two-step release. Review the exact file changes before creating any GitHub commit.</p>
    <div className="publishing-layout">
      <div className="publish-main">
        <Panel className="publish-process"><div className="process-track"><div className={`process-step ${!preview ? 'step-active' : 'step-done'}`}><span>{preview ? <Check size={13} /> : '01'}</span><div><b>Prepare preview</b><small>Fresh credentials · no commit</small></div></div><div className={`process-connector ${preview ? 'connector-done' : ''}`} /><div className={`process-step ${preview ? 'step-active' : ''}`}><span>02</span><div><b>Review & confirm</b><small>Explicit commit approval</small></div></div></div></Panel>
        {showResult && <div className={`result-banner ${showResult.headline.includes('not') || showResult.headline.includes('could') ? 'result-error' : ''}`}><div className="result-icon">{showResult.headline.includes('not') || showResult.headline.includes('could') ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}</div><div><strong>{showResult.headline}</strong><p>{showResult.detail}</p></div><button className="icon-button" onClick={() => setShowResult(null)} aria-label="Dismiss result"><X size={16} /></button></div>}
         {!preview ? <Panel className="publish-form-panel">
           <div className="publish-form-intro"><div className="panel-kicker">STEP 01 / AUTHENTICATE</div><h2>Prepare a change preview</h2><p>Credentials are sent securely for this operation only, then immediately cleared from the form.</p></div>
           <form className="form-stack" onSubmit={requestPreview} autoComplete="off">
             <label className="field"><span>Change set <b>*</b></span><select value={kind} onChange={(e) => setKind(e.target.value as PublishKind)} data-testid="select-publish-kind"><option value="article">Article draft or deletion</option><option value="category">Category draft or deletion</option><option value="site-config">Website & SEO settings</option><option value="ads">Advertising settings</option></select></label>
             {(kind === 'article' || kind === 'category') && <label className="field"><span>Record <b>*</b></span><select value={resourceId} onChange={(e) => setResourceId(e.target.value)} required data-testid="select-publish-resource"><option value="">Select a pending record</option>{resourceOptions.map((r) => <option key={r.id} value={r.id}>{'title' in r ? r.title : r.name}{r.deleteRequested ? ' — deletion' : r.isDirty ? ' — changes' : ' — new draft'}</option>)}</select>{resourceOptions.length === 0 && <small className="field-help">No pending records found. Create or update a draft first.</small>}</label>}
             <div className="credentials-divider"><span>FRESH GITHUB CREDENTIALS</span><span>NEVER STORED</span></div>
             <label className="field"><span>GitHub username <b>*</b></span><input autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Your GitHub username" data-testid="input-github-username" /></label>
             <label className="field"><span>Personal access token <b>*</b></span><input autoComplete="off" type="password" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="Personal access token" data-testid="input-github-token" /><small className="field-help"><LockKeyhole size={12} /> Used once to validate and prepare the preview. Not retained.</small></label>
             {createPreview.isError && <div className="inline-error"><AlertCircle size={14} />{errorMessage(createPreview.error)}</div>}
             <button className="button button-primary button-wide" disabled={createPreview.isPending || ((kind === 'article' || kind === 'category') && resourceOptions.length === 0)} data-testid="button-create-preview">{createPreview.isPending ? <><LoaderCircle size={15} className="spin" /> Preparing secure preview…</> : <>Prepare preview <ArrowUpRight size={15} /></>}</button>
           </form>
         </Panel> :
          <Panel className="preview-panel"><div className="preview-head"><div><div className="panel-kicker">STEP 02 / REVIEW CHANGES</div><h2>Inspect before you commit.</h2><p>Confirm only if every path and change below is expected.</p></div><div className="preview-expiry"><Clock3 size={14} /><span>Expires {expiry}</span></div></div><div className="repo-destination"><Github size={17} /><div><span>DESTINATION</span><strong>{preview.owner}/{preview.repository}</strong></div><span className="repo-branch"><GitBranch size={12} /> {preview.branch}</span></div><div className="commit-message"><span>COMMIT MESSAGE</span><strong>{preview.commitMessage}</strong></div><div className="changes-heading"><span>FILES IN THIS PREVIEW</span><span>{preview.files.length} {preview.files.length === 1 ? 'FILE' : 'FILES'}</span></div>{preview.files.length === 0 ? <div className="empty-state preview-empty">No file changes in this preview.</div> : <div className="file-changes">{preview.files.map((file, index) => <details className="file-change" key={`${file.path}-${index}`} open={index === 0}><summary><span className={`change-action action-${file.action}`}>{file.action}</span><code>{file.path}</code><span className="diff-count"><i>+{file.additions}</i> <em>−{file.deletions}</em></span><ChevronDown size={14} /></summary><div className="file-diff"><div className="diff-header"><span>CHANGE PREVIEW</span><span>Source-backed file diff</span></div>{file.oldContent && <pre className="diff-old">{file.oldContent.slice(0, 2600)}</pre>}{file.newContent && <pre className="diff-new">{file.newContent.slice(0, 3400)}</pre>}{!file.oldContent && !file.newContent && <div className="diff-placeholder">Diff totals shown. File content was not included in this preview.</div>}</div></details>)}</div>}<div className="preview-caution"><AlertCircle size={15} /><span>Confirming creates a commit in the configured repository. This cannot be undone from this console.</span></div><div className="preview-actions"><button className="button button-quiet" onClick={discardPreview} disabled={cancel.isPending || confirm.isPending} data-testid="button-cancel-preview"><X size={15} /> {cancel.isPending ? 'Cancelling…' : 'Cancel preview'}</button><button className="button button-primary" onClick={confirmChanges} disabled={confirm.isPending || cancel.isPending} data-testid="button-confirm-publish">{confirm.isPending ? <><LoaderCircle size={15} className="spin" /> Committing…</> : <><Check size={15} /> Confirm & publish</>}</button></div></Panel>}
        <Panel className="credential-note"><div className="note-icon"><ShieldCheck size={17} /></div><div><strong>Credentials stay transient</strong><p>GitHub credentials are collected per-operation, sent only to create a preview, and cleared immediately. The commit requires a separate confirmation.</p></div></Panel>
      </div>
       <Panel className="history-panel">
         <PanelTitle kicker="AUDIT TRAIL" title="Publishing history" trailing={<Activity size={16} />} />
         {history.isLoading ? <LoadingRows /> : history.isError ? <QueryError retry={() => history.refetch()} /> : !history.data?.length
           ? <div className="empty-state history-empty"><div className="empty-icon"><GitBranch size={18} /></div><strong>No publishing history</strong><p>Confirmed GitHub commits and deployment reports will be listed here.</p></div>
           : <div className="history-list">{history.data.map((entry) =>
             <div className="history-entry" key={entry.id} data-testid={`history-entry-${entry.id}`}>
               <div className="history-entry-mark"><GitBranch size={14} /></div>
               <div className="history-entry-body">
                 <div className="history-entry-top">
                   <StatusBadge tone={entry.deploymentStatus === 'reported_success' ? 'published' : entry.deploymentStatus === 'reported_failure' ? 'danger' : 'neutral'}>Cloudflare · {entry.deploymentStatus.replaceAll('_', ' ')}</StatusBadge>
                   <time>{formatDate(entry.createdAt)}</time>
                 </div>
                 <strong>{entry.path}</strong>
                 <small>GitHub: {entry.githubStatus} · {entry.kind} · {entry.action} · {entry.branch}</small>
                 <div className="commit-reference"><code>{entry.commitSha.slice(0, 7)}</code>{entry.commitUrl && <a href={entry.commitUrl} target="_blank" rel="noreferrer" aria-label="Open commit on GitHub"><ExternalLink size={13} /></a>}</div>
                 {entry.deploymentChecks.length > 0 && <details className="deployment-report"><summary>Reported checks ({entry.deploymentChecks.length})</summary>{entry.deploymentChecks.map((check, index) => <div key={`${check.context}-${index}`}><span>{check.context} · {check.state}</span>{check.targetUrl && <a href={check.targetUrl} target="_blank" rel="noreferrer">Open report</a>}</div>)}</details>}
               </div>
             </div>,
           )}</div>}
       </Panel>
    </div>
  </PageFrame>;
}

function Settings() {
  const github = useGetGitHubSettings(); const site = useGetSiteConfig();
  const saveGithub = useSaveGitHubSettings(); const saveSite = useSaveSiteConfig();
  const qc = useQueryClient();
  const [savedGithub, setSavedGithub] = useState(false); const [savedSite, setSavedSite] = useState(false);
  function submitGithub(fd: FormData) {
    setSavedGithub(false);
    saveGithub.mutate({ data: { owner: String(fd.get('owner')), repository: String(fd.get('repository')), branch: String(fd.get('branch')), commitMessage: String(fd.get('commitMessage')) } }, { onSuccess: () => { setSavedGithub(true); qc.invalidateQueries({ queryKey: getGetGitHubSettingsQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() }); } });
  }
  function submitSite(fd: FormData) {
    setSavedSite(false);
    const payload: SiteConfigInput = { siteUrl: String(fd.get('siteUrl')), name: String(fd.get('name')), tagline: String(fd.get('tagline')), launched: fd.get('launched') === 'on', ogImage: String(fd.get('ogImage')), analyticsProvider: String(fd.get('analyticsProvider')) as SiteConfigInput['analyticsProvider'], analyticsMeasurementId: String(fd.get('analyticsMeasurementId')), adsenseClient: String(fd.get('adsenseClient')), adsenseSlot: String(fd.get('adsenseSlot')) };
    saveSite.mutate({ data: payload }, { onSuccess: () => { setSavedSite(true); qc.invalidateQueries({ queryKey: getGetSiteConfigQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() }); } });
  }
  return <PageFrame path="/settings" eyebrow="CONFIGURATION / 05" title="Settings">
    <p className="page-intro">Configure the destination and supported public-site metadata. Sensitive GitHub credentials are never part of settings.</p>
    <div className="settings-layout">
      <div className="settings-nav"><a href="#repository" className="settings-nav-active"><Github size={15} /> Repository target</a><a href="#website"><Globe2 size={15} /> Website & SEO</a><a href="#measurement"><Activity size={15} /> Analytics & ads</a></div>
      <div className="settings-main">
        <Panel className="settings-panel" id="repository"><div className="settings-panel-head"><div className="settings-panel-icon"><Github size={18} /></div><div><div className="panel-kicker">PUBLISH DESTINATION</div><h2>GitHub repository</h2><p>The allowed repository and branch for all reviewed publishing operations.</p></div><StatusBadge tone={github.data?.configured ? 'published' : 'draft'}>{github.data?.configured ? 'Configured' : 'Needs setup'}</StatusBadge></div>
          {github.isLoading ? <LoadingRows /> : github.isError ? <QueryError retry={() => github.refetch()} /> : <form className="form-stack settings-form" onSubmit={(e) => { e.preventDefault(); submitGithub(new FormData(e.currentTarget)); }}><div className="field-pair"><label className="field"><span>Owner <b>*</b></span><input name="owner" required defaultValue={github.data?.owner ?? ''} placeholder="ainovex" data-testid="input-repository-owner" /></label><label className="field"><span>Repository <b>*</b></span><input name="repository" required defaultValue={github.data?.repository ?? ''} placeholder="editorial-site" data-testid="input-repository-name" /></label></div><div className="field-pair"><label className="field"><span>Default branch <b>*</b></span><input name="branch" required defaultValue={github.data?.branch ?? 'main'} placeholder="main" /></label><label className="field"><span>Default commit message</span><input name="commitMessage" maxLength={200} defaultValue={github.data?.commitMessage ?? 'Update editorial content'} placeholder="Update editorial content" /></label></div><div className="security-callout"><LockKeyhole size={15} /><span><strong>No GitHub credentials are stored here.</strong> Supply fresh credentials only when preparing a publishing preview.</span></div>{saveGithub.isError && <div className="inline-error"><AlertCircle size={14} />{errorMessage(saveGithub.error)}</div>}<div className="form-bottom">{savedGithub && <span className="saved-label"><CheckCircle2 size={14} /> Repository settings saved</span>}<button className="button button-primary" disabled={saveGithub.isPending} data-testid="button-save-github-settings">{saveGithub.isPending ? 'Saving…' : 'Save repository target'} <ArrowUpRight size={14} /></button></div></form>}
        </Panel>
        <Panel className="settings-panel" id="website"><div className="settings-panel-head"><div className="settings-panel-icon"><Globe2 size={18} /></div><div><div className="panel-kicker">SITE METADATA</div><h2>Website & SEO</h2><p>Supported public identity and search presentation settings.</p></div>{site.data?.isDirty && <StatusBadge tone="draft">Draft changes</StatusBadge>}</div>
          {site.isLoading ? <LoadingRows /> : site.isError ? <QueryError retry={() => site.refetch()} /> : <form className="form-stack settings-form" onSubmit={(e) => { e.preventDefault(); submitSite(new FormData(e.currentTarget)); }}><div className="field-pair"><label className="field"><span>Site name <b>*</b></span><input name="name" required defaultValue={site.data?.name ?? ''} placeholder="AINOVEX" /></label><label className="field"><span>Public site URL</span><input name="siteUrl" type="url" defaultValue={site.data?.siteUrl ?? ''} placeholder="https://ainovex.com" /></label></div><label className="field"><span>Tagline</span><input name="tagline" defaultValue={site.data?.tagline ?? ''} placeholder="A concise expression of your publication" /></label><label className="field"><span>Open Graph image URL</span><input name="ogImage" type="url" defaultValue={site.data?.ogImage ?? ''} placeholder="https://…" /></label><label className="toggle-row"><span><b>Site launched</b><small>Controls whether the site is treated as publicly launched.</small></span><input type="checkbox" name="launched" defaultChecked={site.data?.launched ?? false} /></label><div id="measurement" className="settings-subhead"><Activity size={15} /> MEASUREMENT & ADVERTISING</div><div className="field-pair"><label className="field"><span>Analytics provider</span><select name="analyticsProvider" defaultValue={site.data?.analyticsProvider ?? ''}><option value="">Not configured</option><option value="google-analytics">Google Analytics</option></select></label><label className="field"><span>Measurement ID</span><input name="analyticsMeasurementId" defaultValue={site.data?.analyticsMeasurementId ?? ''} placeholder="G-XXXXXXXXXX" /></label></div><div className="field-pair"><label className="field"><span>AdSense client</span><input name="adsenseClient" defaultValue={site.data?.adsenseClient ?? ''} placeholder="ca-pub-…" /></label><label className="field"><span>AdSense slot</span><input name="adsenseSlot" defaultValue={site.data?.adsenseSlot ?? ''} placeholder="1234567890" /></label></div><div className="settings-info"><CircleHelp size={14} />These values create a site-config draft. Publish them from the Publishing page after reviewing the preview.</div>{saveSite.isError && <div className="inline-error"><AlertCircle size={14} />{errorMessage(saveSite.error)}</div>}<div className="form-bottom">{savedSite && <span className="saved-label"><CheckCircle2 size={14} /> Site settings saved as draft</span>}<button className="button button-primary" disabled={saveSite.isPending} data-testid="button-save-site-settings">{saveSite.isPending ? 'Saving…' : 'Save site settings'} <ArrowUpRight size={14} /></button></div></form>}
        </Panel>
      </div>
    </div>
  </PageFrame>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function RouteSwitch() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={Home} />
    <Route path="/sign-in/*?" component={SignInPage} />
    <Route path="/sign-up/*?" component={SignUpPage} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/articles" component={Articles} />
    <Route path="/categories" component={Categories} />
    <Route path="/publishing" component={Publishing} />
    <Route path="/settings" component={Settings} />
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary>;
}

function ClerkRoutes() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const priorUserRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const nextId = user?.id ?? null;
      if (priorUserRef.current !== undefined && priorUserRef.current !== nextId) client.clear();
      priorUserRef.current = nextId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return <RouteSwitch />;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to the AINOVEX control room' } }, signUp: { start: { title: 'Request administrator access', subtitle: 'Create your secure AINOVEX account' } } }} routerPush={(to) => setLocation(stripBase(to))} routerReplace={(to) => setLocation(stripBase(to), { replace: true })}>
    <ClerkRoutes />
  </ClerkProvider>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function errorMessage(error: unknown) {
  const e = error as { message?: string; data?: { error?: string }; response?: { data?: { error?: string } } };
  return e?.data?.error || e?.response?.data?.error || e?.message || 'The request could not be completed.';
}

export default App;
