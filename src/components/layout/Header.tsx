import React from 'react';
import { UserRole, SnapshotMeta } from '../../types';
import { SyncStatus } from '../../context/AppStateContext';
import { Search, PanelLeft, Upload, Database } from 'lucide-react';

interface HeaderProps {
  title: string;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenSbrSearch: () => void;
  onOpenQuickImport: () => void;
  onOpenSnapshotView: () => void;
  snapshotMeta: SnapshotMeta;
  syncStatus: SyncStatus;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  role,
  onRoleChange,
  onOpenSbrSearch,
  onOpenQuickImport,
  onOpenSnapshotView,
  snapshotMeta,
  syncStatus,
  isSidebarOpen = true,
  onToggleSidebar
}) => {
  const statusStyle =
    syncStatus === 'saving'
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : syncStatus === 'saved'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : 'bg-slate-100 border-slate-200 text-slate-700';

  const statusText =
    syncStatus === 'loading'
      ? 'Memuat snapshot.json...'
      : syncStatus === 'saving'
      ? 'Menyimpan JSON...'
      : syncStatus === 'saved'
      ? `snapshot.json • Rev #${snapshotMeta.revision}`
      : `Lokal • Rev #${snapshotMeta.revision}`;

  return (
    <header className="min-h-16 bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base font-bold text-slate-800 tracking-tight">{title}</h1>

        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm text-slate-600">
          <span className="text-slate-500 font-medium">Peran:</span>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent font-semibold text-sky-800 outline-none cursor-pointer"
          >
            <option value="direksi">Direksi (Eksekutif)</option>
            <option value="kadiv">Kepala Divisi CSR (Eksekutif)</option>
            <option value="perencanaan">Bidang Perencanaan (Manajerial)</option>
            <option value="implementasi">Bidang Implementasi (Operasional)</option>
            <option value="pumk">Bidang Koperasi & PUMK (Operasional)</option>
            <option value="monev">Tim Monev (Evaluasi)</option>
            <option value="spi">SPI & Manajemen Risiko (Audit)</option>
            <option value="pemohon">Publik / Pemohon Portal</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSnapshotView}
          className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all hover:opacity-90 ${statusStyle}`}
          title={`Terakhir diperbarui: ${snapshotMeta.lastOperation}`}
        >
          <Database className="w-4 h-4" />
          <span>{statusText}</span>
        </button>

        <button
          onClick={onOpenQuickImport}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sm font-semibold text-sky-800 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Import Data</span>
        </button>

        <button
          onClick={onOpenSbrSearch}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 shadow-xs transition-all"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>Validasi NIK / SBR</span>
        </button>
      </div>
    </header>
  );
};
