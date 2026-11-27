import React, { useState } from 'react';
import { NavView, ImportDatasetType } from './types';
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
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const AppShell: React.FC = () => {
  const { userRole, setUserRole, proposals, sbrDatabase, snapshotMeta, syncStatus, toast, clearToast } = useAppState();
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [integrasiInitialTab, setIntegrasiInitialTab] = useState<'integrasi' | 'config' | 'audit' | 'snapshot'>('integrasi');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuickSbrOpen, setIsQuickSbrOpen] = useState(false);
  const [isQuickImportOpen, setIsQuickImportOpen] = useState(false);
  const [quickNikInput, setQuickNikInput] = useState('1901042508820003');
  const [quickNikResult, setQuickNikResult] = useState<any>(null);

  const pendingProposalsCount = proposals.filter((p) => p.approvalStatus === 'Menunggu').length;

  const getPageTitle = (view: NavView): string => {
    switch (view) {
      case 'dashboard':
        return 'Dashboard Terpadu CSR / TJSL';
      case 'portal':
        return 'Alur Bisnis End-to-End & Portal Pemohon';
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
        return 'Integrasi Enterprise, Konfigurasi Aturan & Audit Trail';
      default:
        return 'Dashboard';
    }
  };

  const getDefaultImportTypeForView = (view: NavView): ImportDatasetType => {
    if (view === 'perencanaan') return 'rkap';
    if (view === 'seleksi' || view === 'portal') return 'proposal';
    if (view === 'pumk') return 'pumk';
    if (view === 'sbr') return 'sbr';
    return 'rkap';
  };

  const handleQuickNikCheck = () => {
    const cleanNik = quickNikInput.replace(/\D/g, '');
    const found = sbrDatabase.find((b) => b.nik === cleanNik);
    if (found) {
      setQuickNikResult(found);
    } else {
      setQuickNikResult({
        nik: cleanNik || quickNikInput,
        name: 'Tidak Ditemukan',
        isNew: true
      });
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      {/* Sidebar — Tanpa Penomoran */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        userRole={userRole}
        proposalPendingCount={pendingProposalsCount}
        isOpen={isSidebarOpen}
      />

      {/* Main View Area — Full Kanan & Kiri */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getPageTitle(currentView)}
          role={userRole}
          onRoleChange={(role) => setUserRole(role)}
          onOpenSbrSearch={() => {
            setIsQuickSbrOpen(true);
            setQuickNikResult(null);
          }}
          onOpenQuickImport={() => setIsQuickImportOpen(true)}
          onOpenSnapshotView={() => {
            setIntegrasiInitialTab('snapshot');
            setCurrentView('integrasi');
          }}
          snapshotMeta={snapshotMeta}
          syncStatus={syncStatus}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6 w-full">
          <div className="w-full">
            {currentView === 'dashboard' && <DashboardView onNavigate={(view) => setCurrentView(view)} />}
            {currentView === 'portal' && <PortalFlowView onNavigate={(view) => setCurrentView(view)} />}
            {currentView === 'perencanaan' && <PerencanaanView />}
            {currentView === 'seleksi' && <SeleksiProposalView />}
            {currentView === 'implementasi' && <ImplementasiView />}
            {currentView === 'flagship' && <FlagshipView />}
            {currentView === 'pumk' && <PumkView />}
            {currentView === 'monev' && <MonevView />}
            {currentView === 'sbr' && <SbrView />}
            {currentView === 'import' && <ImportCenterView />}
            {currentView === 'integrasi' && <IntegrasiView initialTab={integrasiInitialTab} />}
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
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{quickNikResult.name}</div>
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
