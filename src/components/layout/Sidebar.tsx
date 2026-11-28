import React from 'react';
import { NavView, UserRole } from '../../types';
import {
  LayoutDashboard,
  GitBranch,
  CalendarRange,
  FileCheck2,
  Hammer,
  Store,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';
import {
  ActiveJourney,
  ROLE_JOURNEY_PRESETS,
  getRolePolicy,
  isViewAllowedInJourney
} from '../../utils/rbac';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  userRole: UserRole;
  activeJourney: ActiveJourney;
  proposalPendingCount: number;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  userRole,
  activeJourney,
  proposalPendingCount,
  isOpen = true
}) => {
  if (!isOpen) return null;

  const policy = getRolePolicy(userRole);
  const isPublic = userRole === 'pemohon';
  const journeyDef = ROLE_JOURNEY_PRESETS[activeJourney];

  type SidebarNavItem = {
    id: NavView;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  };

  const allOverviewNavItems: SidebarNavItem[] = [
    {
      id: 'dashboard',
      label: isPublic ? 'Ringkasan Publik CSR' : 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    }
  ];

  const overviewNavItems = allOverviewNavItems.filter((item) =>
    isViewAllowedInJourney(userRole, activeJourney, item.id)
  );

  const allProgramNavItems: SidebarNavItem[] = [
    {
      id: 'portal',
      label: isPublic ? 'Portal Pemohon & Aduan' : 'Alur & Portal Pemohon',
      icon: <GitBranch className="w-4 h-4" />
    },
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
      label: activeJourney === 'rkap' ? 'Implementasi SPK PPM' : 'Implementasi & Charity',
      icon: <Hammer className="w-4 h-4" />
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

  const programNavItems = allProgramNavItems.filter((item) =>
    isViewAllowedInJourney(userRole, activeJourney, item.id)
  );

  const allGovernanceNavItems: SidebarNavItem[] = [
    {
      id: 'sbr',
      label: activeJourney === 'pumk' ? 'Registry SBR & Risiko' : 'Registry, Mitra & Aset',
      icon: <UserCheck className="w-4 h-4" />
    },
    {
      id: 'integrasi',
      label: 'Audit & Tata Kelola',
      icon: <ShieldCheck className="w-4 h-4" />
    }
  ];

  const governanceNavItems = allGovernanceNavItems.filter((item) =>
    isViewAllowedInJourney(userRole, activeJourney, item.id)
  );

  const renderGroup = (heading: string, items: SidebarNavItem[]) => {
    if (items.length === 0) return null;
    return (
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
  };

  return (
    <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-900/40 flex-shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-white truncate">CSR &bull; TJSL TIMAH</div>
          <div className="text-sm text-sky-300 font-semibold truncate">{journeyDef.label}</div>
        </div>
      </div>

      {/* Journey-Scoped Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {renderGroup(isPublic ? 'Beranda Publik' : 'Utama', overviewNavItems)}
        {renderGroup(isPublic ? 'Layanan Pemohon' : `Modul ${journeyDef.label}`, programNavItems)}
        {renderGroup('Pengawasan & Data', governanceNavItems)}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-sky-400 flex-shrink-0">
          {policy.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-200 truncate flex items-center gap-1">
            <span className="truncate">{policy.shortName}</span>
            {policy.isReadOnlyAudit && <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
          </div>
          <div className="text-sm text-slate-400 truncate">{policy.subtitle}</div>
        </div>
      </div>
    </aside>
  );
};
