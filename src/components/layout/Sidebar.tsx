import React from 'react';
import { NavView, UserRole } from '../../types';
import {
  LayoutDashboard,
  GitBranch,
  CalendarRange,
  FileCheck2,
  Hammer,
  Award,
  Store,
  TrendingUp,
  UserCheck,
  Upload,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  userRole: UserRole;
  proposalPendingCount: number;
  isOpen?: boolean;
}

const roleProfile: Record<UserRole, { initials: string; name: string; sub: string }> = {
  direksi: { initials: 'DR', name: 'Dewan Direksi', sub: 'Eksekutif Korporat' },
  kadiv: { initials: 'KD', name: 'Kepala Divisi CSR', sub: 'PT Timah Tbk' },
  perencanaan: { initials: 'BP', name: 'Bidang Perencanaan', sub: 'Divisi CSR' },
  implementasi: { initials: 'BI', name: 'Bidang Implementasi', sub: 'Divisi CSR' },
  pumk: { initials: 'BK', name: 'Bidang Koperasi & PUMK', sub: 'Divisi CSR' },
  monev: { initials: 'MV', name: 'Tim Monev & Evaluasi', sub: 'Divisi CSR' },
  spi: { initials: 'SP', name: 'Auditor SPI & MR', sub: 'Pengawasan Internal' },
  pemohon: { initials: 'PM', name: 'Portal Pemohon / Mitra', sub: 'Akses Eksternal' }
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  userRole,
  proposalPendingCount,
  isOpen = true
}) => {
  if (!isOpen) return null;

  const overviewNavItems: { id: NavView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Terpadu',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'portal',
      label: 'Alur & Portal Pemohon',
      icon: <GitBranch className="w-4 h-4" />
    }
  ];

  const cycleNavItems: { id: NavView; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    {
      id: 'perencanaan',
      label: 'Perencanaan & RKAP',
      icon: <CalendarRange className="w-4 h-4" />
    },
    {
      id: 'seleksi',
      label: 'Seleksi Proposal',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: proposalPendingCount > 0 ? `${proposalPendingCount}` : undefined,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'implementasi',
      label: 'Implementasi & Charity',
      icon: <Hammer className="w-4 h-4" />
    },
    {
      id: 'flagship',
      label: 'Program Flagship',
      icon: <Award className="w-4 h-4" />
    },
    {
      id: 'pumk',
      label: 'Koperasi & PUMK',
      icon: <Store className="w-4 h-4" />
    },
    {
      id: 'monev',
      label: 'Monitoring & Evaluasi',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  const governanceNavItems: { id: NavView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'sbr',
      label: 'Registry, Mitra & Aset',
      icon: <UserCheck className="w-4 h-4" />
    },
    {
      id: 'import',
      label: 'Import & Migrasi Data',
      icon: <Upload className="w-4 h-4" />
    },
    {
      id: 'integrasi',
      label: 'Integrasi, Aturan & Audit',
      icon: <ShieldCheck className="w-4 h-4" />
    }
  ];

  const profile = roleProfile[userRole];

  const renderGroup = (
    heading: string,
    items: { id: NavView; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[]
  ) => (
    <div>
      <div className="px-3 pb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
        {heading}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-sm font-semibold px-2 py-0.5 rounded-full text-white ${
                    item.badgeColor || 'bg-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-900/40 flex-shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-white truncate">CSR &bull; TJSL TIMAH</div>
          <div className="text-sm text-slate-400 truncate">Platform PPM & PUMK</div>
        </div>
      </div>

      {/* Navigation Groups — Tanpa Penomoran */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {renderGroup('Utama', overviewNavItems)}
        {renderGroup('Siklus Program', cycleNavItems)}
        {renderGroup('Tata Kelola & Data', governanceNavItems)}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-sky-400 flex-shrink-0">
          {profile.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-200 truncate">{profile.name}</div>
          <div className="text-sm text-slate-400 truncate">{profile.sub}</div>
        </div>
      </div>
    </aside>
  );
};
