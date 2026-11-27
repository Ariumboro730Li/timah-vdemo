import React, { useState, useEffect } from 'react';
import { NavView, ImportDatasetType, UserRole } from './types';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { PortalFlowView } from './components/views/PortalFlowView';
import { PerencanaanView } from './components/views/PerencanaanView';
import { SeleksiProposalView } from './components/views/SeleksiProposalView';
import { ImplementasiView } from './components/views/ImplementasiView';
import { FlagshipView } from './components/views/FlagshipView';
import { PumkView } from './components/views/PumkView';
import { MonevView } from './components/views/MonevView';
import { SbrView } from './components/views/SbrView';
import { ImportCenterView } from './components/views/ImportCenterView';
import { IntegrasiView } from './components/views/IntegrasiView';
import { Modal } from './components/common/Modal';
import { ImportDataModal } from './components/common/ImportDataModal';
import { CheckCircle2, Info, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import {
  ActiveJourney,
  ROLE_JOURNEY_PRESETS,
  getRolePolicy,
  isRoleInJourney,
  getJourneyFirstRole,
  isViewAllowedInJourney,
  getJourneyDefaultViewForRole,
  maskNik
} from './utils/rbac';

type IntegrasiTab = 'integrasi' | 'config' | 'rbac' | 'audit' | 'snapshot';

const VIEW_PATHS: Record<NavView, string> = {
  dashboard: '/dashboard',
  portal: '/portal',
  perencanaan: '/perencanaan',
  seleksi: '/seleksi-proposal',
  implementasi: '/implementasi',
  flagship: '/program-flagship',
  pumk: '/koperasi-pumk',
  monev: '/monitoring-evaluasi',
  sbr: '/registry-sbr',
  import: '/import-data',
  integrasi: '/integrasi-audit'
};

const PATH_TO_VIEW: Record<string, NavView> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/portal': 'portal',
  '/portal-pemohon': 'portal',
  '/perencanaan': 'perencanaan',
  '/seleksi': 'seleksi',
  '/seleksi-proposal': 'seleksi',
  '/implementasi': 'implementasi',
  '/flagship': 'flagship',
  '/program-flagship': 'flagship',
  '/pumk': 'pumk',
  '/koperasi-pumk': 'pumk',
  '/monev': 'monev',
  '/monitoring-evaluasi': 'monev',
  '/sbr': 'sbr',
  '/registry-sbr': 'sbr',
  '/import': 'import',
  '/import-data': 'import',
  '/integrasi': 'integrasi',
  '/integrasi-audit': 'integrasi'
};

const VALID_INTEGRASI_TABS: IntegrasiTab[] = ['integrasi', 'config', 'rbac', 'audit', 'snapshot'];

function parseRouteFromLocation(fallbackView: NavView): { view: NavView; integrasiTab: IntegrasiTab | null } {
  const rawPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const normalizedPath = rawPath.toLowerCase();
  const view = PATH_TO_VIEW[normalizedPath] || fallbackView;

  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab') as IntegrasiTab | null;
  const integrasiTab = tabParam && VALID_INTEGRASI_TABS.includes(tabParam) ? tabParam : null;

  return { view, integrasiTab };
}

function buildUrlForView(view: NavView, integrasiTab?: IntegrasiTab | null): string {
  const basePath = VIEW_PATHS[view] || '/dashboard';
  if (view === 'integrasi' && integrasiTab && integrasiTab !== 'integrasi') {
    return `${basePath}?tab=${integrasiTab}`;
  }
  return basePath;
}

const AppShell: React.FC = () => {
  const {
    userRole,
    setUserRole,
    activeJourney,
    setActiveJourney,
    showToast,
    proposals,
    sbrDatabase,
    snapshotMeta,
    syncStatus,
    toast,
    clearToast
  } = useAppState();

  const effectiveRole: UserRole = isRoleInJourney(userRole, activeJourney)
    ? userRole
    : getJourneyFirstRole(activeJourney);

  // Align stored role if it is outside the active journey
  useEffect(() => {
    if (effectiveRole !== userRole) {
      setUserRole(effectiveRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJourney, effectiveRole, userRole]);

  const defaultViewForActive = getJourneyDefaultViewForRole(effectiveRole, activeJourney);
  const initialRoute = parseRouteFromLocation(defaultViewForActive);

  const [currentView, setCurrentView] = useState<NavView>(() =>
    isViewAllowedInJourney(effectiveRole, activeJourney, initialRoute.view)
      ? initialRoute.view
      : defaultViewForActive
  );
  const [integrasiInitialTab, setIntegrasiInitialTab] = useState<IntegrasiTab>(
    initialRoute.integrasiTab || (effectiveRole === 'spi' ? 'audit' : 'audit')
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuickSbrOpen, setIsQuickSbrOpen] = useState(false);
  const [isQuickImportOpen, setIsQuickImportOpen] = useState(false);
  const [quickNikInput, setQuickNikInput] = useState('1901042508820003');
  const [quickNikResult, setQuickNikResult] = useState<any>(null);

  const policy = getRolePolicy(effectiveRole);
  const effectiveView: NavView = isViewAllowedInJourney(effectiveRole, activeJourney, currentView)
    ? currentView
    : defaultViewForActive;

  const syncBrowserUrl = (view: NavView, mode: 'push' | 'replace', tab?: IntegrasiTab | null) => {
    const targetUrl = buildUrlForView(view, tab);
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl === targetUrl) return;
    if (mode === 'push') {
      window.history.pushState({ view, tab: tab || null }, '', targetUrl);
    } else {
      window.history.replaceState({ view, tab: tab || null }, '', targetUrl);
    }
  };

  // Normalize initial URL on mount
  useEffect(() => {
    syncBrowserUrl(effectiveView, 'replace', effectiveView === 'integrasi' ? integrasiInitialTab : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const rolePolicy = getRolePolicy(effectiveRole);
      const fallback = getJourneyDefaultViewForRole(effectiveRole, activeJourney);
      const parsed = parseRouteFromLocation(fallback);
      if (isViewAllowedInJourney(effectiveRole, activeJourney, parsed.view)) {
        setCurrentView(parsed.view);
        if (parsed.view === 'integrasi') {
          setIntegrasiInitialTab(parsed.integrasiTab || 'audit');
        }
      } else {
        setCurrentView(fallback);
        syncBrowserUrl(fallback, 'replace');
        showToast(
          `Halaman tujuan berada di luar ${ROLE_JOURNEY_PRESETS[activeJourney].label} untuk peran ${rolePolicy.label}.`,
          'warning'
        );
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [effectiveRole, activeJourney, showToast]);

  const handleJourneyChange = (nextJourney: ActiveJourney) => {
    setActiveJourney(nextJourney);
    const nextRole = isRoleInJourney(effectiveRole, nextJourney)
      ? effectiveRole
      : getJourneyFirstRole(nextJourney);
    if (nextRole !== userRole) {
      setUserRole(nextRole);
    }
    const targetView = getJourneyDefaultViewForRole(nextRole, nextJourney);
    const nextTab: IntegrasiTab = nextRole === 'spi' ? 'audit' : integrasiInitialTab;
    if (nextRole === 'spi') setIntegrasiInitialTab('audit');

    setCurrentView(targetView);
    syncBrowserUrl(targetView, 'push', targetView === 'integrasi' ? nextTab : null);
    showToast(
      `Fokus diubah ke ${ROLE_JOURNEY_PRESETS[nextJourney].label} (${getRolePolicy(nextRole).shortName}). Hanya modul & fitur alur ini yang ditampilkan.`,
      'info'
    );
  };

  const handleRoleChange = (nextRole: UserRole) => {
    setUserRole(nextRole);
    const nextPolicy = getRolePolicy(nextRole);
    const targetView = getJourneyDefaultViewForRole(nextRole, activeJourney);
    const nextTab: IntegrasiTab = nextRole === 'spi' ? 'audit' : integrasiInitialTab;
    if (nextRole === 'spi') {
      setIntegrasiInitialTab('audit');
    }

    setCurrentView(targetView);
    syncBrowserUrl(targetView, 'push', targetView === 'integrasi' ? nextTab : null);

    showToast(
      `Beralih ke ${nextPolicy.label} pada ${ROLE_JOURNEY_PRESETS[activeJourney].label} (${getPageTitle(targetView)}).`,
      'info'
    );
  };

  const handleNavigate = (view: NavView, tab?: IntegrasiTab) => {
    if (!isViewAllowedInJourney(effectiveRole, activeJourney, view)) {
      showToast(
        `Menu tersebut tidak termasuk dalam ${ROLE_JOURNEY_PRESETS[activeJourney].label} untuk peran ${policy.label}.`,
        'warning'
      );
      return;
    }
    const targetTab = view === 'integrasi' ? tab || integrasiInitialTab : null;
    if (view === 'integrasi' && tab) {
      setIntegrasiInitialTab(tab);
    }
    setCurrentView(view);
    syncBrowserUrl(view, 'push', targetTab);
  };

  const pendingProposalsCount = proposals.filter(
    (p) => p.approvalStatus === 'Menunggu' && p.recommendation !== 'Ditolak'
  ).length;

  const getPageTitle = (view: NavView): string => {
    switch (view) {
      case 'dashboard':
        return userRole === 'pemohon' ? 'Ringkasan Publik Program CSR / TJSL' : 'Dashboard CSR / TJSL';
      case 'portal':
        return userRole === 'pemohon'
          ? 'Portal Pemohon, Lacak Tiket & Pengaduan Masyarakat'
          : 'Alur Bisnis End-to-End & Portal Pemohon';
      case 'perencanaan':
        return 'Perencanaan Program, Social Mapping & RKAP';
      case 'seleksi':
        return 'Seleksi & Scoring Proposal';
      case 'implementasi':
        return 'Implementasi PPM & Bantuan Charity';
      case 'flagship':
        return 'Program Flagship & Analisis SROI';
      case 'pumk':
        return 'Pengembangan Koperasi & Pendanaan PUMK';
      case 'monev':
        return 'Monitoring, Evaluasi & Closed-Loop Learning';
      case 'sbr':
        return 'Registry Penerima (SBR), Mitra, Aset & Risiko';
      case 'import':
        return 'Pusat Import & Migrasi Data';
      case 'integrasi':
        return 'Integrasi Enterprise, Konfigurasi RBAC & Audit Trail';
      default:
        return 'Dashboard';
    }
  };

  useEffect(() => {
    document.title = `${getPageTitle(effectiveView)} — CSR TJSL PT Timah Tbk`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveView, userRole]);

  const getDefaultImportTypeForView = (view: NavView): ImportDatasetType => {
    const allowed = policy.allowedImportTypes;
    const candidate: ImportDatasetType =
      view === 'perencanaan'
        ? 'rkap'
        : view === 'seleksi' || view === 'portal'
        ? 'proposal'
        : view === 'pumk'
        ? 'pumk'
        : view === 'sbr'
        ? 'sbr'
        : 'rkap';
    if (allowed.includes(candidate)) return candidate;
    return allowed[0] || 'rkap';
  };

  const handleQuickNikCheck = () => {
    const cleanNik = quickNikInput.replace(/\D/g, '');
    const found = sbrDatabase.find((b) => b.nik === cleanNik);
    const matchedProposals = proposals.filter((p) => p.nik === cleanNik);
    if (found) {
      setQuickNikResult({ ...found, matchedProposals });
    } else if (matchedProposals.length > 0) {
      const first = matchedProposals[0];
      setQuickNikResult({
        nik: cleanNik,
        name: first.applicant,
        address: `${first.location} (${first.ring})`,
        isBlacklisted: first.sbrStatus === 'Blacklist',
        programHistory: [],
        matchedProposals
      });
    } else {
      setQuickNikResult({
        nik: cleanNik || quickNikInput,
        name: 'Tidak Ditemukan',
        isNew: true,
        matchedProposals: []
      });
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      {/* Sidebar — Journey-Scoped & Strict RBAC */}
      <Sidebar
        currentView={effectiveView}
        onNavigate={handleNavigate}
        userRole={effectiveRole}
        activeJourney={activeJourney}
        proposalPendingCount={pendingProposalsCount}
        isOpen={isSidebarOpen}
      />

      {/* Main View Area — Full Kanan & Kiri */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getPageTitle(effectiveView)}
          role={effectiveRole}
          activeJourney={activeJourney}
          onRoleChange={handleRoleChange}
          onJourneyChange={handleJourneyChange}
          onOpenSbrSearch={() => {
            setIsQuickSbrOpen(true);
            setQuickNikResult(null);
          }}
          onOpenSnapshotView={() => {
            handleNavigate('integrasi', 'snapshot');
          }}
          snapshotMeta={snapshotMeta}
          syncStatus={syncStatus}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6 w-full">
          <div className="w-full space-y-5">
            {policy.isReadOnlyAudit && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0" />
                  <span>
                    <strong>Mode Audit Independen SPI & Manajemen Risiko (Segregation of Duties):</strong> Seluruh modul transaksi operasional bersifat <strong>Read-Only</strong>. Pengendalian aktif pada Risk Register, Anti-Fraud/Blacklist, dan Audit Trail.
                  </span>
                </div>
              </div>
            )}
            {effectiveView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
            {effectiveView === 'portal' && <PortalFlowView onNavigate={handleNavigate} />}
            {effectiveView === 'perencanaan' && <PerencanaanView />}
            {effectiveView === 'seleksi' && <SeleksiProposalView />}
            {effectiveView === 'implementasi' && <ImplementasiView />}
            {effectiveView === 'flagship' && <FlagshipView />}
            {effectiveView === 'pumk' && <PumkView />}
            {effectiveView === 'monev' && <MonevView />}
            {effectiveView === 'sbr' && <SbrView />}
            {effectiveView === 'import' && <ImportCenterView />}
            {effectiveView === 'integrasi' && (
              <IntegrasiView
                initialTab={integrasiInitialTab}
                onTabChange={(tab) => {
                  setIntegrasiInitialTab(tab);
                  syncBrowserUrl('integrasi', 'push', tab);
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Live Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
            toast.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : toast.type === 'info'
              ? 'bg-sky-50 border-sky-300 text-sky-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          {toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span className="font-semibold flex-1">{toast.message}</span>
          <button onClick={clearToast} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick SBR Check Modal */}
      <Modal
        isOpen={isQuickSbrOpen}
        onClose={() => setIsQuickSbrOpen(false)}
        title="Validasi Cepat NIK & Single Beneficiary Registry (SBR)"
        footer={
          <button
            onClick={() => setIsQuickSbrOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white font-semibold"
          >
            Tutup
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Periksa nomor KTP/NIK untuk memvalidasi kesesuaian data dengan Dukcapil dan mendeteksi apakah pemohon pernah menerima bantuan di tahun berjalan atau program lain.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={quickNikInput}
              onChange={(e) => setQuickNikInput(e.target.value)}
              placeholder="Masukkan 16 digit NIK..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500 font-mono"
            />
            <button
              onClick={handleQuickNikCheck}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold shadow-xs"
            >
              Cek NIK
            </button>
          </div>

          {quickNikResult && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              {quickNikResult.isNew ? (
                <div className="text-emerald-800 font-medium">
                  ✓ <strong>NIK Belum Terdaftar di SBR:</strong> Belum pernah menerima bantuan sebelumnya. Memenuhi syarat untuk diverifikasi lebih lanjut.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{quickNikResult.name}</div>
                      <div className="font-mono text-sky-800">
                        NIK: {maskNik(quickNikResult.nik, userRole)}{' '}
                      </div>
                    </div>
                    {quickNikResult.isBlacklisted && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">BLACKLIST</span>
                    )}
                  </div>
                  <div className="text-slate-600">Alamat: {quickNikResult.address}</div>
                  <div className="p-3 bg-white border border-slate-200 rounded text-slate-700 mt-2 space-y-1">
                    <span className="font-semibold block text-slate-800">Riwayat Bantuan ({quickNikResult.programHistory?.length || 0} catatan):</span>
                    {quickNikResult.programHistory && quickNikResult.programHistory.length > 0 ? (
                      quickNikResult.programHistory.map((h: any, idx: number) => (
                        <div key={idx} className="border-t border-slate-100 pt-1">
                          {h.programName} ({h.year}) &bull; <strong>Rp {h.amount.toLocaleString('id-ID')}</strong> ({h.status})
                        </div>
                      ))
                    ) : (
                      <div>Tidak ada catatan bantuan lalu.</div>
                    )}
                  </div>
                  {quickNikResult.matchedProposals && quickNikResult.matchedProposals.length > 0 && (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded text-sky-950 mt-2 space-y-1">
                      <span className="font-semibold block text-sky-900">
                        Proposal Masuk Terdaftar ({quickNikResult.matchedProposals.length}):
                      </span>
                      {quickNikResult.matchedProposals.map((p: any) => (
                        <div key={p.id} className="border-t border-sky-200/70 pt-1">
                          <span className="font-mono font-bold">{p.ticketNo}</span> &bull; {p.category} &bull;{' '}
                          <strong>Rp {p.requestedAmount.toLocaleString('id-ID')}</strong> ({p.approvalStatus})
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Quick Global Import Data Modal */}
      <ImportDataModal
        isOpen={isQuickImportOpen}
        onClose={() => setIsQuickImportOpen(false)}
        defaultType={getDefaultImportTypeForView(currentView)}
        allowSwitchType={true}
      />
    </div>
  );
};

export function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}

export default App;
