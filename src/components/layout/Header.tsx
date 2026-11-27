import React, { useState, useRef, useEffect } from 'react';
import { UserRole, SnapshotMeta } from '../../types';
import { SyncStatus, useAppState } from '../../context/AppStateContext';
import {
  Search,
  PanelLeft,
  Database,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  ShieldCheck,
  EyeOff,
  GitBranch,
  Info
} from 'lucide-react';
import {
  ActiveJourney,
  JOURNEY_ORDER,
  getRolePolicy,
  ROLE_POLICIES,
  ROLE_JOURNEY_PRESETS
} from '../../utils/rbac';

interface HeaderProps {
  title: string;
  role: UserRole;
  activeJourney: ActiveJourney;
  onRoleChange: (role: UserRole) => void;
  onJourneyChange: (journey: ActiveJourney) => void;
  onOpenSbrSearch: () => void;
  onOpenSnapshotView: () => void;
  snapshotMeta: SnapshotMeta;
  syncStatus: SyncStatus;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const getStepTone = (isFirst: boolean, isLast: boolean) => {
  if (isFirst) {
    return {
      circle: 'bg-emerald-600 text-white border-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      triggerBadge: 'bg-emerald-600 text-white'
    };
  }
  if (isLast) {
    return {
      circle: 'bg-amber-600 text-white border-amber-600',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      triggerBadge: 'bg-amber-600 text-white'
    };
  }
  return {
    circle: 'bg-sky-700 text-white border-sky-700',
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
    triggerBadge: 'bg-sky-700 text-white'
  };
};

export const Header: React.FC<HeaderProps> = ({
  title,
  role,
  activeJourney,
  onRoleChange,
  onJourneyChange,
  onOpenSbrSearch,
  onOpenSnapshotView,
  snapshotMeta,
  syncStatus,
  isSidebarOpen = true,
  onToggleSidebar
}) => {
  const {
    proposals,
    rkapList,
    projects,
    charities,
    pumkApplications,
    pumkLoans,
    monevIssues,
    auditLogs
  } = useAppState();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const policy = getRolePolicy(role);
  const journeyDef = ROLE_JOURNEY_PRESETS[activeJourney];
  const steps = journeyDef.steps;

  const currentIdx = steps.findIndex((s) => s.role === role);
  const activeStepNumber = currentIdx >= 0 ? currentIdx + 1 : 1;
  const activeStep = currentIdx >= 0 ? steps[currentIdx] : steps[0];
  const activeTone = getStepTone(activeStepNumber === 1, activeStepNumber === steps.length);

  const prevStep = currentIdx > 0 ? steps[currentIdx - 1] : null;
  const nextStep = currentIdx >= 0 && currentIdx < steps.length - 1 ? steps[currentIdx + 1] : null;

  useEffect(() => {
    if (!isRoleMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsRoleMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRoleMenuOpen]);

  // Live workload summaries scoped to the active journey
  const pendingSelectionCount = proposals.filter(
    (p) => p.approvalStatus === 'Menunggu' && p.recommendation !== 'Ditolak'
  ).length;
  const rkapDraftCount = rkapList.filter((r) => r.status === 'Draft').length;
  const rkapKadivCount = rkapList.filter((r) => r.status === 'Review Kabid').length;
  const rkapDireksiCount = rkapList.filter((r) => r.status === 'Review Kadiv').length;
  const activeProjectsCount = projects.filter((p) => p.lpjStatus !== 'Terverifikasi').length;
  const activeCharitiesCount = charities.filter((c) => c.disbursementStatus !== 'BAST Selesai').length;
  const pendingPumkCount = pumkApplications.filter(
    (a) => a.status !== 'Disetujui & Cair' && a.status !== 'Ditolak'
  ).length;
  const proposalKadivQueue = proposals.filter(
    (p) =>
      p.approvalStatus === 'Menunggu' &&
      p.recommendation !== 'Ditolak' &&
      ((p.reviewerScores.length > 0 && p.committeeDecision === 'Belum Rapat') ||
        (p.committeeDecision === 'Disetujui Komite' &&
          p.requestedAmount > 20_000_000 &&
          p.requestedAmount <= 100_000_000))
  ).length;
  const proposalDireksiQueue = proposals.filter(
    (p) =>
      p.approvalStatus === 'Menunggu' &&
      p.committeeDecision === 'Disetujui Komite' &&
      p.requestedAmount > 100_000_000
  ).length;
  const openIssuesCount = monevIssues.filter(
    (i) => i.status !== 'Selesai Verifikasi' && i.status !== 'Ditolak'
  ).length;

  const getRoleLiveBadge = (r: UserRole): string => {
    if (activeJourney === 'proposal') {
      switch (r) {
        case 'pemohon':
          return `${proposals.length} proposal tercatat`;
        case 'implementasi':
          return `${pendingSelectionCount} seleksi · ${activeProjectsCount + activeCharitiesCount} berjalan`;
        case 'kadiv':
          return `${proposalKadivQueue} menunggu Komite/Approve`;
        case 'direksi':
          return `${proposalDireksiQueue} butuh Approve >100 Jt`;
        case 'monev':
          return `${openIssuesCount} temuan/aduan aktif`;
        case 'spi':
          return `${auditLogs.length} log audit · Read-Only`;
        default:
          return '';
      }
    }
    if (activeJourney === 'rkap') {
      switch (r) {
        case 'perencanaan':
          return `${rkapDraftCount} Draft · ${rkapList.length} total RKAP`;
        case 'kadiv':
          return `${rkapKadivCount} menunggu Approve Kadiv`;
        case 'direksi':
          return `${rkapDireksiCount} butuh Pengesahan Direksi`;
        case 'implementasi':
          return `${activeProjectsCount} proyek SPK aktif`;
        case 'monev':
          return `${openIssuesCount} temuan · Closed-Loop`;
        case 'spi':
          return `${auditLogs.length} log audit · Read-Only`;
        default:
          return '';
      }
    }
    // pumk
    switch (r) {
      case 'pumk':
        return `${pendingPumkCount} proses 5C · ${pumkLoans.length} pinjaman`;
      case 'kadiv':
        return `${pendingPumkCount} menunggu Komite PUMK`;
      case 'monev':
        return `${pumkLoans.length} pinjaman dipantau`;
      case 'spi':
        return `${auditLogs.length} log audit · Read-Only`;
      default:
        return '';
    }
  };

  const handleSelectRole = (nextRole: UserRole) => {
    onRoleChange(nextRole);
    setIsRoleMenuOpen(false);
  };

  const statusStyle =
    syncStatus === 'saving'
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : syncStatus === 'saved'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : 'bg-slate-100 border-slate-200 text-slate-700';

  return (
    <header className="min-h-16 bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 relative z-30">
      <div className="flex flex-wrap items-center gap-3">
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

        {/* Focused Journey & Role Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsRoleMenuOpen((prev) => !prev)}
            aria-expanded={isRoleMenuOpen}
            aria-haspopup="listbox"
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-all shadow-xs ${
              isRoleMenuOpen
                ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-100'
                : 'bg-slate-50 hover:bg-sky-50/70 border-slate-200 hover:border-sky-300'
            }`}
            title={`${journeyDef.label} · Langkah ${activeStepNumber}/${steps.length} — ${activeStep.note}`}
          >
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-sm">
              {journeyDef.label}
            </span>
            <span
              className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-sm flex-shrink-0 ${activeTone.triggerBadge}`}
            >
              {activeStepNumber}
            </span>
            <span className="font-bold text-slate-900">{policy.label}</span>
            <span
              className={`hidden xl:inline-flex items-center px-2 py-0.5 rounded-md border font-semibold text-sm ${activeTone.badge}`}
            >
              {activeStep.stepLabel}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${
                isRoleMenuOpen ? 'rotate-180 text-sky-700' : ''
              }`}
            />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute left-0 mt-2 w-[min(94vw,720px)] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50">
              {/* Popover Header — ONLY the 3 Focused Journeys */}
              <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white space-y-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-base">
                    <GitBranch className="w-4 h-4 text-sky-300" />
                    <span>Pilih Alur Kerja & Urutan Peran</span>
                  </div>
                  <p className="text-sm text-sky-100/90 mt-1">
                    Pilih salah satu alur di bawah. Hanya modul, peran, dan fitur yang relevan dengan alur terpilih yang ditampilkan agar lebih fokus dan mudah dipahami.
                  </p>
                </div>

                {/* 3 Journey Switcher Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {JOURNEY_ORDER.map((jid) => {
                    const def = ROLE_JOURNEY_PRESETS[jid];
                    const active = activeJourney === jid;
                    return (
                      <button
                        key={jid}
                        type="button"
                        onClick={() => onJourneyChange(jid)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                          active
                            ? 'bg-white text-slate-900 border-white shadow-xs'
                            : 'bg-white/10 text-sky-100 border-white/15 hover:bg-white/20'
                        }`}
                      >
                        {def.label} ({def.steps.length} Peran)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Journey Context Banner */}
              <div className="px-5 py-2.5 bg-sky-50 border-b border-sky-200 text-sm text-sky-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-sky-700 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{journeyDef.label} Aktif:</strong> {journeyDef.description}
                </span>
              </div>

              {/* Ordered Timeline of Roles for Active Journey */}
              <div className="max-h-[54vh] overflow-y-auto px-4 py-3 space-y-2 bg-slate-50/70">
                {steps.map((step, idx) => {
                  const rp = ROLE_POLICIES[step.role];
                  const isActive = step.role === role;
                  const isFirst = idx === 0;
                  const isLast = idx === steps.length - 1;
                  const tone = getStepTone(isFirst, isLast);

                  return (
                    <div key={`${activeJourney}-${step.role}`} className="relative flex items-stretch gap-3">
                      {/* Vertical Connector Rail */}
                      <div className="flex flex-col items-center flex-shrink-0 pt-3">
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm z-10 ${
                            isActive ? `${tone.circle} ring-4 ring-sky-200` : tone.circle
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 bg-slate-300 my-1 min-h-[20px]" />}
                      </div>

                      {/* Interactive Role Card */}
                      <button
                        type="button"
                        onClick={() => handleSelectRole(step.role)}
                        className={`flex-1 text-left rounded-xl border p-3.5 transition-all ${
                          isActive
                            ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200/80 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/40'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{rp.label}</span>
                            <span className={`px-2 py-0.5 rounded-md border text-sm font-semibold ${tone.badge}`}>
                              {step.stepLabel}
                            </span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-700 text-white font-semibold text-sm">
                                <Check className="w-3.5 h-3.5" />
                                Aktif
                              </span>
                            )}
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm">
                            {getRoleLiveBadge(step.role)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                          <span className="font-bold text-slate-900">Note:</span> {step.note}
                        </p>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-sm">
                          <div className="inline-flex items-center gap-1.5 text-sky-900 font-medium">
                            <ArrowRight className="w-4 h-4 text-sky-600 flex-shrink-0" />
                            <span>
                              <strong>Lanjut ke:</strong> {step.nextHint}
                            </span>
                          </div>

                       
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Quick Step Footer */}
              <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="text-slate-600 font-medium">
                  <span>
                    {journeyDef.label}:{' '}
                    <strong className="text-slate-900">
                      Langkah {activeStepNumber} dari {steps.length}
                    </strong>{' '}
                    ({policy.shortName})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {prevStep && (
                    <button
                      type="button"
                      onClick={() => handleSelectRole(prevStep.role)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>
                        #{currentIdx} {ROLE_POLICIES[prevStep.role].shortName}
                      </span>
                    </button>
                  )}
                  {nextStep && (
                    <button
                      type="button"
                      onClick={() => handleSelectRole(nextStep.role)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold transition-colors shadow-xs"
                    >
                      <span>
                        Lanjut #{currentIdx + 2}: {ROLE_POLICIES[nextStep.role].shortName}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {policy.canViewSnapshotPill && (
          <button
            onClick={onOpenSnapshotView}
            className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all hover:opacity-90 ${statusStyle}`}
            title={`Terakhir diperbarui: ${snapshotMeta.lastOperation}`}
          >
            <Database className="w-4 h-4" />
          </button>
        )}

        {policy.canUseQuickSbr && (
          <button
            onClick={onOpenSbrSearch}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 shadow-xs transition-all"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Validasi NIK / SBR</span>
          </button>
        )}
      </div>
    </header>
  );
};
