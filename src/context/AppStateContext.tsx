import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserRole,
  AppSnapshot,
  SnapshotMeta,
  SocialMappingRegion,
  RkapItem,
  ScoringRubricCriterion,
  ApprovalMatrixRule,
  ProposalItem,
  ProjectItem,
  CharityItem,
  FlagshipProgram,
  FlagshipPerformanceScores,
  PumkApplication,
  PumkLoan,
  CooperativeItem,
  UmkCatalogItem,
  MonevIndicator,
  MonevIssue,
  LessonLearned,
  SbrBeneficiary,
  PartnerVendor,
  ProgramAsset,
  RiskItem,
  AuditLog
} from '../types';
import {
  monthlyBudgetData as fallbackMonthly,
  pillarDistributionData as fallbackPillar,
  regionalDistributionData as fallbackRegional,
  pumkNplTrendData as fallbackNpl,
  initialSocialMapping,
  initialRkapList,
  defaultScoringRubric,
  defaultApprovalMatrix,
  initialProposalList,
  initialProjectList,
  initialCharityList,
  initialFlagshipList,
  initialPumkApplications,
  initialPumkLoans,
  initialCooperatives,
  initialUmkCatalog,
  initialMonevIndicators,
  initialMonevIssues,
  initialLessonsLearned,
  initialSbrDatabase,
  initialPartners,
  initialProgramAssets,
  initialRisks,
  initialAuditLogs
} from '../data/mockData';

import {
  getRkapApprovalPermission,
  canRoleApproveByAuthority,
  getCharityActionPermission
} from '../utils/rbac';

const LOCAL_STORAGE_KEY = 'timah_csr_snapshot_json_v1';
const ROLE_STORAGE_KEY = 'timah_csr_active_role_v1';
const VALID_ROLES: UserRole[] = [
  'direksi',
  'kadiv',
  'perencanaan',
  'implementasi',
  'pumk',
  'monev',
  'spi',
  'sysadmin',
  'pemohon'
];

export type SyncStatus = 'loading' | 'saving' | 'saved' | 'local-fallback';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface AppStateContextValue {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  clearToast: () => void;

  // Snapshot metadata & controls
  snapshot: AppSnapshot;
  snapshotMeta: SnapshotMeta;
  syncStatus: SyncStatus;
  downloadSnapshotJson: () => void;
  restoreSnapshotJson: (newSnap: AppSnapshot, sourceLabel?: string) => Promise<void>;
  resetSnapshotToSeed: () => Promise<void>;

  // Charts & Entities (from live snapshot)
  monthlyBudgetData: AppSnapshot['monthlyBudgetData'];
  pillarDistributionData: AppSnapshot['pillarDistributionData'];
  regionalDistributionData: AppSnapshot['regionalDistributionData'];
  pumkNplTrendData: AppSnapshot['pumkNplTrendData'];
  socialMapping: SocialMappingRegion[];
  rkapList: RkapItem[];
  scoringRubric: ScoringRubricCriterion[];
  approvalMatrix: ApprovalMatrixRule[];
  proposals: ProposalItem[];
  projects: ProjectItem[];
  charities: CharityItem[];
  flagships: FlagshipProgram[];
  pumkApplications: PumkApplication[];
  pumkLoans: PumkLoan[];
  cooperatives: CooperativeItem[];
  umkCatalog: UmkCatalogItem[];
  monevIndicators: MonevIndicator[];
  monevIssues: MonevIssue[];
  lessonsLearned: LessonLearned[];
  sbrDatabase: SbrBeneficiary[];
  partners: PartnerVendor[];
  programAssets: ProgramAsset[];
  risks: RiskItem[];
  auditLogs: AuditLog[];

  // Actions — Module 1 Planning
  addSocialMappingRegions: (items: SocialMappingRegion[], sourceLabel?: string) => void;
  addRkapItems: (items: RkapItem[], sourceLabel?: string) => void;
  advanceRkapStatus: (id: string) => void;
  convertRkapToProject: (rkapId: string) => void;

  // Actions — Portal & Module 2d Selection
  submitProposal: (item: Omit<ProposalItem, 'id' | 'ticketNo' | 'sbrStatus' | 'nlpSimilarityPercent' | 'adminScreeningStatus' | 'reviewerScores' | 'recommendation' | 'committeeDecision' | 'approvalStatus' | 'dateSubmitted'>) => ProposalItem;
  importProposalsBatch: (items: ProposalItem[]) => void;
  saveProposalScore: (proposalId: string, reviewerName: string, totalScore: number, notes: string) => void;
  decideProposalCommittee: (proposalId: string, decision: ProposalItem['committeeDecision']) => void;
  approveProposalFinal: (proposalId: string) => void;
  convertProposalToExecution: (proposalId: string) => void;

  // Actions — Module 2a/2b Implementation & Charity
  advanceProjectProgress: (projectId: string) => void;
  completeProjectBast: (projectId: string) => void;
  addCharityItem: (item: Omit<CharityItem, 'id' | 'ticketNo' | 'approverLevel' | 'fraudFlags' | 'disbursementStatus' | 'dateSubmitted'>) => CharityItem;
  advanceCharityStatus: (charityId: string) => void;

  // Actions — Module 2c Flagship
  updateFlagshipPerformance: (id: string, scores: FlagshipPerformanceScores) => void;
  advanceFlagshipTier: (id: string) => void;

  // Actions — Module 3 PUMK & Koperasi
  submitPumkApplication: (app: Omit<PumkApplication, 'id' | 'regNo' | 'status'>) => PumkApplication;
  advancePumkApplication: (appId: string) => void;
  payPumkInstallment: (loanId: string) => void;
  assignPumkCollection: (loanId: string) => void;
  restructurePumkLoan: (loanId: string) => void;
  importPumkLoansBatch: (items: PumkLoan[]) => void;

  // Actions — Module 4 Monev & Closed-Loop
  addMonevIssue: (issue: Omit<MonevIssue, 'id' | 'ticketNo'>) => void;
  updateMonevIssueStatus: (id: string, status: MonevIssue['status']) => void;
  addLessonLearned: (lesson: Omit<LessonLearned, 'id' | 'appliedToRkap'>) => void;
  applyLessonToRkap: (lessonId: string) => void;

  // Actions — Supporting (SBR, Partners, Assets, Risks, Config)
  importSbrBatch: (items: SbrBeneficiary[]) => void;
  toggleSbrBlacklist: (nik: string, reason?: string) => void;
  importPartnersBatch: (items: PartnerVendor[]) => void;
  togglePartnerBlacklist: (id: string) => void;
  updateScoringRubric: (rubric: ScoringRubricCriterion[]) => void;
  updateApprovalMatrix: (matrix: ApprovalMatrixRule[]) => void;
  logAction: (module: string, action: string, objectRef: string) => void;
  getApproverByAmount: (amount: number) => 'Kabid' | 'Kepala Divisi' | 'Direksi / Komite';
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const roleDisplayMap: Record<UserRole, { name: string; title: string }> = {
  direksi: { name: 'Direktur Operasional & SDM', title: 'Direksi' },
  kadiv: { name: 'Ir. Ahmad Zulkarnain', title: 'Kepala Divisi CSR' },
  perencanaan: { name: 'Rini Kusumawati', title: 'Kabid Perencanaan CSR' },
  implementasi: { name: 'Hendra Saputra', title: 'Kabid Implementasi CSR' },
  pumk: { name: 'Budi Santoso', title: 'Kabid Koperasi & PUMK' },
  monev: { name: 'Dedi Kurniawan', title: 'Koordinator Tim Monev' },
  spi: { name: 'Drs. Wahyu Pratama', title: 'Auditor SPI & MR' },
  sysadmin: { name: 'Fajar Ramadhan', title: 'System Admin (TI)' },
  pemohon: { name: 'Masyarakat / Mitra Eksternal', title: 'Pemohon Portal' }
};

function createFallbackSnapshot(): AppSnapshot {
  return {
    meta: {
      version: '1.0.0',
      revision: 1,
      updatedAt: new Date().toISOString(),
      lastOperation: 'Memuat data awal fallback'
    },
    monthlyBudgetData: fallbackMonthly,
    pillarDistributionData: fallbackPillar,
    regionalDistributionData: fallbackRegional,
    pumkNplTrendData: fallbackNpl,
    socialMapping: initialSocialMapping,
    rkapList: initialRkapList,
    scoringRubric: defaultScoringRubric,
    approvalMatrix: defaultApprovalMatrix,
    proposals: initialProposalList,
    projects: initialProjectList,
    charities: initialCharityList,
    flagships: initialFlagshipList,
    pumkApplications: initialPumkApplications,
    pumkLoans: initialPumkLoans,
    cooperatives: initialCooperatives,
    umkCatalog: initialUmkCatalog,
    monevIndicators: initialMonevIndicators,
    monevIssues: initialMonevIssues,
    lessonsLearned: initialLessonsLearned,
    sbrDatabase: initialSbrDatabase,
    partners: initialPartners,
    programAssets: initialProgramAssets,
    risks: initialRisks,
    auditLogs: initialAuditLogs
  };
}

function recomputeAggregates(snap: AppSnapshot): AppSnapshot {
  const pillarSum = { Ekonomi: 0, Lingkungan: 0, Sosial: 0, 'Hukum & Tata Kelola': 0 };
  for (const r of snap.rkapList) {
    if (pillarSum[r.pillar] !== undefined) {
      pillarSum[r.pillar] += r.budget;
    }
  }
  const pillarDistributionData = [
    { name: 'Pilar Ekonomi (PPM & PUMK)', value: Number((pillarSum['Ekonomi'] / 1e9).toFixed(2)), color: '#0284c7' },
    { name: 'Pilar Lingkungan (Reklamasi)', value: Number((pillarSum['Lingkungan'] / 1e9).toFixed(2)), color: '#16a34a' },
    { name: 'Pilar Sosial (Charity & Kes)', value: Number((pillarSum['Sosial'] / 1e9).toFixed(2)), color: '#f59e0b' },
    { name: 'Pilar Hukum & Tata Kelola', value: Number((pillarSum['Hukum & Tata Kelola'] / 1e9).toFixed(2)), color: '#6366f1' }
  ];

  const regMap = new Map<string, { budget: number; projects: number }>();
  for (const r of snap.rkapList) {
    const mainReg = r.location.split(', ').pop() || r.location;
    const cur = regMap.get(mainReg) || { budget: 0, projects: 0 };
    cur.budget += r.budget;
    cur.projects += 1;
    regMap.set(mainReg, cur);
  }
  const regionalDistributionData = Array.from(regMap.entries())
    .map(([region, v]) => ({ region, budget: Number((v.budget / 1e9).toFixed(2)), projects: v.projects }))
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 6);

  return {
    ...snap,
    pillarDistributionData,
    regionalDistributionData
  };
}

function formatNowWib(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `27 Nov 2026 ${hh}:${mm} WIB`;
}

function upsertSbrList(
  list: SbrBeneficiary[],
  nik: string,
  name: string,
  address: string,
  ring: 'Ring 1' | 'Ring 2' | 'Ring 3',
  historyItem: SbrBeneficiary['programHistory'][0]
): SbrBeneficiary[] {
  const idx = list.findIndex((b) => b.nik === nik);
  if (idx >= 0) {
    const updated = [...list];
    updated[idx] = {
      ...updated[idx],
      programHistory: [historyItem, ...updated[idx].programHistory]
    };
    return updated;
  }
  return [
    {
      nik,
      name,
      address,
      ring,
      isBlacklisted: false,
      graduationStatus: 'Pemula',
      programHistory: [historyItem]
    },
    ...list
  ];
}

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
      if (saved && VALID_ROLES.includes(saved)) return saved;
    } catch {
      // ignore storage errors
    }
    return 'kadiv';
  });

  const setUserRole = (nextRole: UserRole) => {
    setUserRoleState(nextRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    } catch {
      // ignore storage errors
    }
  };
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [snapshot, setSnapshot] = useState<AppSnapshot>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.meta && Array.isArray(parsed?.rkapList)) {
          return parsed;
        }
      }
    } catch {
      // ignore cache errors
    }
    return createFallbackSnapshot();
  });

  // Always keep a ref to latest snapshot and serialize disk writes in order
  const snapshotRef = useRef<AppSnapshot>(snapshot);
  snapshotRef.current = snapshot;
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Load real JSON snapshot from /api/snapshot (data/snapshot.json) on startup
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/snapshot', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const serverSnap: AppSnapshot = await res.json();
        if (active && serverSnap?.meta && Array.isArray(serverSnap.rkapList)) {
          snapshotRef.current = serverSnap;
          setSnapshot(serverSnap);
          setSyncStatus('saved');
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverSnap));
          } catch {
            // ignore quota errors
          }
        }
      } catch {
        if (active) {
          setSyncStatus('local-fallback');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = String(Date.now());
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  };

  const clearToast = () => setToast(null);

  const enqueuePersist = (nextSnap: AppSnapshot) => {
    setSyncStatus('saving');
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextSnap));
    } catch {
      // ignore localStorage quota errors for huge snapshots
    }

    writeQueueRef.current = writeQueueRef.current.then(async () => {
      try {
        const res = await fetch('/api/snapshot', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextSnap)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        if (payload?.meta) {
          setSnapshot((curr) => ({ ...curr, meta: payload.meta }));
        }
        setSyncStatus('saved');
      } catch {
        setSyncStatus('local-fallback');
      }
    });
  };

  // Unified mutation helper: computes next snapshot, attaches audit log, updates state & persists to data/snapshot.json!
  const commitMutation = (
    mutator: (prev: AppSnapshot) => AppSnapshot,
    audit?: { module: string; action: string; objectRef: string },
    recomputeCharts = false
  ) => {
    const prev = snapshotRef.current;
    let next = mutator(prev);
    if (recomputeCharts) {
      next = recomputeAggregates(next);
    }

    const actor = roleDisplayMap[userRole];
    const nextAuditLogs = audit
      ? [
          {
            id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: formatNowWib(),
            user: actor.name,
            role: actor.title,
            module: audit.module,
            action: audit.action,
            objectRef: audit.objectRef,
            ipAddress: '10.20.14.88'
          },
          ...next.auditLogs
        ]
      : next.auditLogs;

    const finalSnap: AppSnapshot = {
      ...next,
      auditLogs: nextAuditLogs,
      meta: {
        version: prev.meta?.version || '1.0.0',
        revision: (prev.meta?.revision || 0) + 1,
        updatedAt: new Date().toISOString(),
        lastOperation: audit ? `${audit.module}: ${audit.action} (${audit.objectRef})` : 'Pembaruan data'
      }
    };

    snapshotRef.current = finalSnap;
    setSnapshot(finalSnap);
    enqueuePersist(finalSnap);
  };

  const logAction = (module: string, action: string, objectRef: string) => {
    commitMutation((prev) => prev, { module, action, objectRef });
  };

  const getApproverByAmount = (amount: number): 'Kabid' | 'Kepala Divisi' | 'Direksi / Komite' => {
    const sorted = [...snapshotRef.current.approvalMatrix].sort(
      (a, b) => (a.maxAmount ?? Infinity) - (b.maxAmount ?? Infinity)
    );
    for (const rule of sorted) {
      if (rule.maxAmount === null || amount <= rule.maxAmount) {
        if (rule.approver.toLowerCase().includes('direksi')) return 'Direksi / Komite';
        if (rule.approver.toLowerCase().includes('divisi')) return 'Kepala Divisi';
        return 'Kabid';
      }
    }
    return 'Direksi / Komite';
  };

  // --- Snapshot File Operations ---
  const downloadSnapshotJson = () => {
    const blob = new Blob([JSON.stringify(snapshotRef.current, null, 2) + '\n'], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshot_csr_timah_rev${snapshotRef.current.meta.revision}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreSnapshotJson = async (newSnap: AppSnapshot, sourceLabel = 'Unggah Snapshot JSON') => {
    commitMutation(
      () => newSnap,
      { module: 'Snapshot JSON', action: `Pulihkan / timpa seluruh snapshot (${sourceLabel})`, objectRef: `REV-${newSnap.meta?.revision || 1}` },
      true
    );
    showToast('Seluruh database berhasil diperbarui dari file Snapshot JSON & disimpan ke data/snapshot.json.');
  };

  const resetSnapshotToSeed = async () => {
    setSyncStatus('saving');
    try {
      const res = await fetch('/api/snapshot/reset', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const resetSnap: AppSnapshot = await res.json();
      snapshotRef.current = resetSnap;
      setSnapshot(resetSnap);
      setSyncStatus('saved');
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resetSnap));
      } catch {
        // ignore
      }
      showToast('Snapshot data/snapshot.json berhasil dikembalikan ke seed awal (926 record).', 'info');
    } catch {
      const fallback = createFallbackSnapshot();
      snapshotRef.current = fallback;
      setSnapshot(fallback);
      setSyncStatus('local-fallback');
      showToast('Snapshot dikembalikan ke data awal lokal.', 'info');
    }
  };

  // --- Module 1: Planning ---
  const addSocialMappingRegions = (items: SocialMappingRegion[], sourceLabel = 'Manual') => {
    commitMutation(
      (prev) => ({ ...prev, socialMapping: [...items, ...prev.socialMapping] }),
      { module: 'Perencanaan (Social Mapping)', action: `Impor/Tambah ${items.length} data wilayah (${sourceLabel})`, objectRef: `SM-BATCH-${items.length}` }
    );
    showToast(`${items.length} data Social Mapping disimpan ke data/snapshot.json.`);
  };

  const addRkapItems = (items: RkapItem[], sourceLabel = 'Manual') => {
    commitMutation(
      (prev) => ({ ...prev, rkapList: [...items, ...prev.rkapList] }),
      { module: 'Perencanaan & RKAP', action: `Tambah/Impor ${items.length} program RKAP (${sourceLabel})`, objectRef: items[0]?.code || 'RKAP-BATCH' },
      true
    );
    showToast(`${items.length} program RKAP disimpan ke data/snapshot.json.`);
  };

  const advanceRkapStatus = (id: string) => {
    const target = snapshotRef.current.rkapList.find((r) => r.id === id);
    if (!target) return;
    const perm = getRkapApprovalPermission(userRole, target.status);
    if (!perm.allowed) {
      showToast(`Akses ditolak: Tahap ${target.status} hanya dapat disetujui oleh ${perm.requiredRoleLabel}.`, 'warning');
      return;
    }
    const flow: RkapItem['status'][] = ['Draft', 'Review Kabid', 'Review Kadiv', 'Disetujui Direksi'];
    const nextStatus = flow[Math.min(flow.indexOf(target.status) + 1, flow.length - 1)];
    commitMutation(
      (prev) => ({
        ...prev,
        rkapList: prev.rkapList.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
      }),
      { module: 'Perencanaan & RKAP', action: `Persetujuan berjenjang (e-Sign) -> ${nextStatus}`, objectRef: target.code }
    );
    showToast(`Program ${target.code} diperbarui ke ${nextStatus} & tersimpan di snapshot JSON.`);
  };

  const convertRkapToProject = (rkapId: string) => {
    const rkap = snapshotRef.current.rkapList.find((r) => r.id === rkapId);
    if (!rkap) return;
    const spkNo = `SPK/CSR/2026/${String(snapshotRef.current.projects.length + 1).padStart(3, '0')}`;
    const sapPoNo = `450089${String(400 + snapshotRef.current.projects.length)}`;
    const newProject: ProjectItem = {
      id: `prj-${Date.now()}`,
      spkNo,
      sourceRkapCode: rkap.code,
      title: rkap.title,
      partner: rkap.synergyPartner || 'Mitra Pelaksana Terpilih',
      pillar: rkap.pillar,
      location: rkap.location,
      geotagCoord: '-2.1316, 106.1169',
      contractValue: rkap.budget,
      realizedValue: 0,
      currentTerm: 'Inisiasi / Persiapan SPK (0%)',
      sapPoNo,
      sapStatus: 'Pending Approval',
      geotagPhotos: 0,
      qrAttendanceCount: 0,
      progressPercent: 10,
      ragStatus: 'Hijau',
      changeRequests: 0,
      lpjStatus: 'Belum',
      bastSigned: false,
      exitStrategy: `Pengelolaan mandiri masyarakat berdasarkan outcome: ${rkap.theoryOfChange.outcome}`,
      milestones: [
        { id: 'm1', name: 'Assessment Baseline & Mobilisasi Mitra', targetDate: '15 Des 2026', weightPercent: 30, status: 'Berjalan' },
        { id: 'm2', name: 'Pelaksanaan Kegiatan Utama & Pembinaan', targetDate: '15 Feb 2027', weightPercent: 45, status: 'Tertunda' },
        { id: 'm3', name: 'Verifikasi Output, LPJ & Serah Terima BAST', targetDate: '30 Mar 2027', weightPercent: 25, status: 'Tertunda' }
      ]
    };
    commitMutation(
      (prev) => ({
        ...prev,
        projects: [newProject, ...prev.projects],
        rkapList: prev.rkapList.map((r) => (r.id === rkapId ? { ...r, convertedToImpl: true, committedBudget: r.budget } : r))
      }),
      { module: 'Implementasi PPM', action: `Turunkan RKAP menjadi Proyek SPK (${spkNo})`, objectRef: rkap.code }
    );
    showToast(`RKAP ${rkap.code} diturunkan ke Implementasi (${spkNo}) & snapshot JSON diperbarui.`);
  };

  // --- Portal & Module 2d: Selection ---
  const submitProposal: AppStateContextValue['submitProposal'] = (input) => {
    const existingSbr = snapshotRef.current.sbrDatabase.find((b) => b.nik === input.nik.trim());
    const hasRecentAid = existingSbr?.programHistory.some((h) => h.year >= 2025);
    const isBlacklisted = existingSbr?.isBlacklisted;

    const sbrStatus: ProposalItem['sbrStatus'] = isBlacklisted
      ? 'Blacklist'
      : hasRecentAid
      ? 'Duplikasi Terdeteksi'
      : existingSbr
      ? 'Terverifikasi'
      : 'Unik (Bersih)';

    const knockOut = isBlacklisted || hasRecentAid;
    const ticketNo = `PROP-2026-${String(snapshotRef.current.proposals.length + 108)}`;
    const newProposal: ProposalItem = {
      ...input,
      id: `prop-${Date.now()}`,
      ticketNo,
      sbrStatus,
      nlpSimilarityPercent: hasRecentAid ? 81 : Math.floor(Math.random() * 20) + 8,
      adminScreeningStatus: knockOut ? 'Gugur' : 'Lolos',
      reviewerScores: knockOut
        ? [{ reviewerName: 'Sistem SBR Otomatis', date: '27 Nov 2026', totalScore: 45, notes: 'Terdeteksi duplikasi bantuan / blacklist di SBR' }]
        : [],
      score: knockOut ? 45 : undefined,
      recommendation: knockOut ? 'Ditolak' : 'Menunggu Review',
      committeeDecision: knockOut ? 'Ditolak' : 'Belum Rapat',
      approvalStatus: knockOut ? 'Ditolak' : 'Menunggu',
      dateSubmitted: '27 Nov 2026'
    };

    commitMutation(
      (prev) => ({ ...prev, proposals: [newProposal, ...prev.proposals] }),
      { module: 'Seleksi Proposal', action: `Intake proposal baru via ${input.channel} (SBR: ${sbrStatus})`, objectRef: ticketNo }
    );
    showToast(
      knockOut
        ? `Proposal ${ticketNo} tersimpan ke snapshot dengan peringatan SBR (${sbrStatus}).`
        : `Proposal ${ticketNo} diregistrasi & disimpan ke data/snapshot.json.`,
      knockOut ? 'warning' : 'success'
    );
    return newProposal;
  };

  const importProposalsBatch = (items: ProposalItem[]) => {
    commitMutation(
      (prev) => ({ ...prev, proposals: [...items, ...prev.proposals] }),
      { module: 'Import Data', action: `Impor massal ${items.length} proposal masuk & cek SBR`, objectRef: `IMP-PROP-${items.length}` }
    );
    showToast(`${items.length} proposal berhasil diimpor & disimpan ke data/snapshot.json.`);
  };

  const saveProposalScore = (proposalId: string, reviewerName: string, totalScore: number, notes: string) => {
    const prop = snapshotRef.current.proposals.find((p) => p.id === proposalId);
    commitMutation(
      (prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) => {
          if (p.id !== proposalId) return p;
          const allScores = [...p.reviewerScores, { reviewerName, date: '27 Nov 2026', totalScore, notes }];
          const avg = parseFloat((allScores.reduce((acc, s) => acc + s.totalScore, 0) / allScores.length).toFixed(1));
          const isKnockOut = p.sbrStatus === 'Duplikasi Terdeteksi' || p.sbrStatus === 'Blacklist';
          const recommendation: ProposalItem['recommendation'] = isKnockOut
            ? 'Ditolak'
            : avg >= 80
            ? 'Prioritas Disetujui'
            : avg >= 65
            ? 'Layak Bersyarat'
            : 'Ditolak';
          return { ...p, reviewerScores: allScores, score: avg, recommendation };
        })
      }),
      { module: 'Seleksi Proposal', action: `Input skoring rubrik terbobot (Skor: ${totalScore.toFixed(1)})`, objectRef: prop?.ticketNo || proposalId }
    );
    showToast(`Skor penilaian (${totalScore.toFixed(1)}) tersimpan ke data/snapshot.json.`);
  };

  const decideProposalCommittee = (proposalId: string, decision: ProposalItem['committeeDecision']) => {
    const prop = snapshotRef.current.proposals.find((p) => p.id === proposalId);
    commitMutation(
      (prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === proposalId
            ? { ...p, committeeDecision: decision, approvalStatus: decision === 'Ditolak' ? 'Ditolak' : p.approvalStatus }
            : p
        )
      }),
      { module: 'Komite Seleksi', action: `Keputusan forum komite: ${decision}`, objectRef: prop?.ticketNo || proposalId }
    );
    showToast(`Keputusan Komite (${decision}) tersimpan ke data/snapshot.json.`);
  };

  const approveProposalFinal = (proposalId: string) => {
    const prop = snapshotRef.current.proposals.find((p) => p.id === proposalId);
    if (!prop) return;
    const approver = getApproverByAmount(prop.requestedAmount);
    if (!canRoleApproveByAuthority(userRole, approver)) {
      showToast(
        `Akses ditolak (Lampiran B KAK): Nilai Rp ${prop.requestedAmount.toLocaleString('id-ID')} memerlukan persetujuan ${approver}.`,
        'warning'
      );
      return;
    }
    commitMutation(
      (prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === proposalId
            ? { ...p, approvalStatus: 'Disetujui', committeeDecision: p.committeeDecision === 'Belum Rapat' ? 'Disetujui Komite' : p.committeeDecision }
            : p
        )
      }),
      { module: 'Persetujuan Proposal', action: `Persetujuan e-Sign sesuai matriks (${approver})`, objectRef: prop.ticketNo }
    );
    showToast(`Proposal ${prop.ticketNo} disetujui (${approver}) & tersimpan di snapshot JSON.`);
  };

  const convertProposalToExecution = (proposalId: string) => {
    const prop = snapshotRef.current.proposals.find((p) => p.id === proposalId);
    if (!prop || prop.convertedToImpl) return;

    if (prop.programType === 'Bantuan Charity') {
      const ticketNo = `CHR-2026-${String(snapshotRef.current.charities.length + 1).padStart(3, '0')}`;
      const newCharity: CharityItem = {
        id: `ch-${Date.now()}`,
        ticketNo,
        applicant: prop.applicant,
        nik: prop.nik,
        accountNo: 'Rekening Terverifikasi Penerima (H2H)',
        category: (['Bencana', 'Keagamaan', 'Pendidikan', 'Kesehatan', 'Sarana Umum'].includes(prop.category)
          ? prop.category
          : 'Sarana Umum') as CharityItem['category'],
        isFastTrack: prop.channel === 'Fast-Track Darurat',
        requestedAmount: prop.requestedAmount,
        location: prop.location,
        geotagCoord: prop.geotagCoord || '-2.1316, 106.1169',
        conflictOfInterestDeclared: true,
        fraudFlags: [],
        approverLevel: getApproverByAmount(prop.requestedAmount),
        disbursementStatus: 'Menunggu Persetujuan',
        dateSubmitted: '27 Nov 2026'
      };
      commitMutation(
        (prev) => ({
          ...prev,
          charities: [newCharity, ...prev.charities],
          proposals: prev.proposals.map((p) => (p.id === proposalId ? { ...p, convertedToImpl: true } : p)),
          sbrDatabase: upsertSbrList(prev.sbrDatabase, prop.nik, prop.applicant, prop.location, prop.ring, {
            year: 2026,
            programName: prop.category,
            type: prop.programType,
            amount: prop.requestedAmount,
            status: 'Disetujui & Berjalan'
          })
        }),
        { module: 'Implementasi Charity', action: `Konversi proposal ke tiket Bantuan Charity (${ticketNo})`, objectRef: prop.ticketNo }
      );
      showToast(`Proposal ${prop.ticketNo} dikonversi ke Charity (${ticketNo}) & tersimpan ke snapshot JSON.`);
    } else {
      const spkNo = `SPK/CSR/2026/${String(snapshotRef.current.projects.length + 1).padStart(3, '0')}`;
      const newProject: ProjectItem = {
        id: `prj-${Date.now()}`,
        spkNo,
        sourceProposalTicket: prop.ticketNo,
        title: `${prop.category} — ${prop.applicant}`,
        partner: prop.applicant,
        pillar: 'Ekonomi',
        location: prop.location,
        geotagCoord: prop.geotagCoord || '-2.1316, 106.1169',
        contractValue: prop.requestedAmount,
        realizedValue: 0,
        currentTerm: 'Termin 1 (Persiapan SPK)',
        sapPoNo: `450089${String(500 + snapshotRef.current.projects.length)}`,
        sapStatus: 'Pending Approval',
        geotagPhotos: 1,
        qrAttendanceCount: 0,
        progressPercent: 15,
        ragStatus: 'Hijau',
        changeRequests: 0,
        lpjStatus: 'Belum',
        bastSigned: false,
        exitStrategy: 'Pendampingan kelompok selama 12 bulan menuju kemandirian operasional',
        milestones: [
          { id: 'm1', name: 'Penerbitan SPK & Verifikasi Rekening', targetDate: '10 Des 2026', weightPercent: 30, status: 'Selesai' },
          { id: 'm2', name: 'Realisasi Fisik & Pendampingan Lapangan', targetDate: '20 Jan 2027', weightPercent: 50, status: 'Berjalan' },
          { id: 'm3', name: 'LPJ & Serah Terima BAST', targetDate: '15 Feb 2027', weightPercent: 20, status: 'Tertunda' }
        ]
      };
      commitMutation(
        (prev) => ({
          ...prev,
          projects: [newProject, ...prev.projects],
          proposals: prev.proposals.map((p) => (p.id === proposalId ? { ...p, convertedToImpl: true } : p)),
          sbrDatabase: upsertSbrList(prev.sbrDatabase, prop.nik, prop.applicant, prop.location, prop.ring, {
            year: 2026,
            programName: prop.category,
            type: prop.programType,
            amount: prop.requestedAmount,
            status: 'Disetujui & Berjalan'
          })
        }),
        { module: 'Implementasi PPM', action: `Konversi proposal ke Proyek SPK (${spkNo})`, objectRef: prop.ticketNo }
      );
      showToast(`Proposal ${prop.ticketNo} menjadi kontrak SPK (${spkNo}) & tersimpan di snapshot JSON.`);
    }
  };

  // --- Module 2a/2b: Implementation & Charity ---
  const advanceProjectProgress = (projectId: string) => {
    const prj = snapshotRef.current.projects.find((p) => p.id === projectId);
    if (!prj) return;
    const nextProgress = Math.min(100, prj.progressPercent + 30);
    const nextRealized = Math.min(prj.contractValue, Math.round((prj.contractValue * nextProgress) / 100));
    commitMutation(
      (prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                progressPercent: nextProgress,
                realizedValue: nextRealized,
                sapStatus: nextProgress === 100 ? 'Settled' : 'Posted',
                currentTerm: nextProgress === 100 ? 'Pencairan Penuh (100%)' : `Termin Lanjutan (${nextProgress}%)`,
                geotagPhotos: p.geotagPhotos + 4,
                ragStatus: 'Hijau'
              }
            : p
        )
      }),
      { module: 'Implementasi PPM', action: `Verifikasi output lapangan & pencairan SAP (${nextProgress}%)`, objectRef: prj.spkNo }
    );
    showToast(`Termin proyek ${prj.spkNo} (${nextProgress}%) diperbarui di data/snapshot.json.`);
  };

  const completeProjectBast = (projectId: string) => {
    const prj = snapshotRef.current.projects.find((p) => p.id === projectId);
    if (!prj) return;
    const bastNo = `BAST/CSR/2026/${String(snapshotRef.current.programAssets.length + 1).padStart(3, '0')}`;
    const newAsset: ProgramAsset = {
      id: `ast-${Date.now()}`,
      assetCode: `AST-CSR-2026-${String(snapshotRef.current.programAssets.length + 1).padStart(3, '0')}`,
      assetName: prj.title,
      programTitle: prj.title,
      recipientCommunity: prj.partner,
      bastNo,
      handoverDate: '27 Nov 2026',
      value: prj.contractValue,
      location: prj.location,
      geotagCoord: prj.geotagCoord,
      condition: 'Baik',
      maintenanceSchedule: 'Triwulan II 2027'
    };
    commitMutation(
      (prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId
            ? { ...p, progressPercent: 100, realizedValue: p.contractValue, sapStatus: 'Settled', lpjStatus: 'Terverifikasi', bastSigned: true }
            : p
        ),
        programAssets: [newAsset, ...prev.programAssets]
      }),
      { module: 'Implementasi & Aset', action: `Penutupan LPJ, BAST e-Sign (${bastNo}) & registrasi Aset`, objectRef: prj.spkNo }
    );
    showToast(`BAST ${bastNo} selesai & aset otomatis tersimpan di data/snapshot.json.`);
  };

  const addCharityItem: AppStateContextValue['addCharityItem'] = (input) => {
    const existingSbr = snapshotRef.current.sbrDatabase.find((b) => b.nik === input.nik.trim());
    const flags: string[] = [];
    if (existingSbr?.programHistory.some((h) => h.year >= 2025)) {
      flags.push('Pemohon berulang terdeteksi di SBR (2025/2026)');
    }
    if (!input.conflictOfInterestDeclared) {
      flags.push('Deklarasi bebas benturan kepentingan (COI) belum disetujui');
    }
    if (input.requestedAmount > 100000000 && !input.isFastTrack) {
      flags.push('Nominal di atas rata-rata bantuan charity reguler (butuh approval Direksi)');
    }
    const ticketNo = `CHR-2026-${String(snapshotRef.current.charities.length + 1).padStart(3, '0')}`;
    const newCharity: CharityItem = {
      ...input,
      id: `ch-${Date.now()}`,
      ticketNo,
      fraudFlags: flags,
      approverLevel: getApproverByAmount(input.requestedAmount),
      disbursementStatus: input.isFastTrack ? 'Menunggu Persetujuan' : 'Verifikasi',
      dateSubmitted: '27 Nov 2026'
    };
    commitMutation(
      (prev) => ({ ...prev, charities: [newCharity, ...prev.charities] }),
      { module: 'Bantuan Charity', action: `Registrasi tiket bantuan (${input.isFastTrack ? 'Fast-Track Darurat' : 'Reguler'})`, objectRef: ticketNo }
    );
    showToast(`Tiket Bantuan Charity ${ticketNo} tersimpan ke data/snapshot.json.`);
    return newCharity;
  };

  const advanceCharityStatus = (charityId: string) => {
    const item = snapshotRef.current.charities.find((c) => c.id === charityId);
    if (!item) return;
    const perm = getCharityActionPermission(userRole, item);
    if (!perm.allowed) {
      showToast(`Akses ditolak (SOP 11.2 / Lampiran B): Tahap ini memerlukan ${perm.lockedReason}.`, 'warning');
      return;
    }
    const flow: CharityItem['disbursementStatus'][] = ['Verifikasi', 'Menunggu Persetujuan', 'Cair ke Penerima', 'BAST Selesai'];
    const nextStatus = flow[Math.min(flow.indexOf(item.disbursementStatus) + 1, flow.length - 1)];
    const bastNo = nextStatus === 'BAST Selesai' ? `BAST/${item.ticketNo}` : item.bastNo;

    commitMutation(
      (prev) => ({
        ...prev,
        charities: prev.charities.map((c) => (c.id === charityId ? { ...c, disbursementStatus: nextStatus, bastNo } : c)),
        sbrDatabase:
          nextStatus === 'Cair ke Penerima'
            ? upsertSbrList(prev.sbrDatabase, item.nik, item.applicant, item.location, 'Ring 1', {
                year: 2026,
                programName: `Bantuan Charity ${item.category}`,
                type: 'Charity TJSL',
                amount: item.requestedAmount,
                status: 'Cair Langsung ke Penerima'
              })
            : prev.sbrDatabase
      }),
      { module: 'Bantuan Charity', action: `Update status penyaluran -> ${nextStatus}`, objectRef: item.ticketNo }
    );
    showToast(`Bantuan ${item.ticketNo} diperbarui (${nextStatus}) & tersimpan di snapshot JSON.`);
  };

  // --- Module 2c: Flagship ---
  const updateFlagshipPerformance = (id: string, scores: FlagshipPerformanceScores) => {
    const flg = snapshotRef.current.flagships.find((f) => f.id === id);
    const total =
      scores.output * 0.25 +
      scores.outcome * 0.35 +
      scores.efficiency * 0.15 +
      scores.governance * 0.15 +
      scores.satisfaction * 0.10;
    const rag: FlagshipProgram['ragStatus'] = total >= 70 ? 'Hijau' : total >= 55 ? 'Kuning' : 'Merah';
    commitMutation(
      (prev) => ({
        ...prev,
        flagships: prev.flagships.map((f) => (f.id === id ? { ...f, performanceScores: scores, ragStatus: rag } : f))
      }),
      { module: 'Program Flagship', action: `Update skoring kinerja periodik (Skor: ${total.toFixed(1)})`, objectRef: flg?.code || id }
    );
    showToast(`Skor kinerja Flagship (${total.toFixed(1)}) tersimpan ke data/snapshot.json.`);
  };

  const advanceFlagshipTier = (id: string) => {
    const flg = snapshotRef.current.flagships.find((f) => f.id === id);
    if (!flg) return;
    const tiers: FlagshipProgram['graduationTier'][] = ['Pemula', 'Berkembang', 'Mandiri', 'Naik Kelas'];
    const nextTier = tiers[Math.min(tiers.indexOf(flg.graduationTier) + 1, tiers.length - 1)];
    commitMutation(
      (prev) => ({
        ...prev,
        flagships: prev.flagships.map((f) => (f.id === id ? { ...f, graduationTier: nextTier } : f))
      }),
      { module: 'Program Flagship', action: `Kenaikan kelas graduasi penerima -> ${nextTier}`, objectRef: flg.code }
    );
    showToast(`Graduasi ${flg.name} naik ke ${nextTier} & tersimpan ke snapshot JSON.`);
  };

  // --- Module 3: PUMK ---
  const submitPumkApplication: AppStateContextValue['submitPumkApplication'] = (input) => {
    const regNo = `REG-PUMK-2026-${String(snapshotRef.current.pumkApplications.length + 1).padStart(3, '0')}`;
    const newApp: PumkApplication = {
      ...input,
      id: `app-${Date.now()}`,
      regNo,
      status: 'Onboarding'
    };
    commitMutation(
      (prev) => ({ ...prev, pumkApplications: [newApp, ...prev.pumkApplications] }),
      { module: 'Koperasi & PUMK', action: `Onboarding permohonan pembiayaan baru (Skor 5C: ${input.creditScore})`, objectRef: regNo }
    );
    showToast(`Permohonan PUMK ${regNo} tersimpan ke data/snapshot.json.`);
    return newApp;
  };

  const advancePumkApplication = (appId: string) => {
    const app = snapshotRef.current.pumkApplications.find((a) => a.id === appId);
    if (!app) return;
    const flow: PumkApplication['status'][] = ['Onboarding', 'Survei Lapangan', 'Komite Pendanaan', 'Disetujui & Cair'];
    const nextIdx = Math.min(flow.indexOf(app.status) + 1, flow.length - 1);
    const nextStatus = flow[nextIdx];

    if (nextStatus === 'Disetujui & Cair') {
      const contractNo = `PUMK-2026-${String(snapshotRef.current.pumkLoans.length + 130)}`;
      const vaNumber = `887910${String(250000 + snapshotRef.current.pumkLoans.length)}`;
      const newLoan: PumkLoan = {
        id: `loan-${Date.now()}`,
        contractNo,
        vaNumber,
        borrowerName: app.businessName,
        nik: app.nik,
        businessType: app.businessType,
        location: app.location,
        geotagCoord: app.geotagCoord,
        ceiling: app.recommendedPlafon,
        remainingPrincipal: app.recommendedPlafon,
        monthlyInstallment: Math.round((app.recommendedPlafon * 1.03) / app.tenorMonths),
        tenorMonths: app.tenorMonths,
        paidInstallments: 0,
        dpd: 0,
        collectibility: 'Lancar',
        creditScore: Math.round(app.creditScore),
        lastPaymentDate: 'Baru Cair (27 Nov 2026)',
        graduationStatus: 'Pemula'
      };
      commitMutation(
        (prev) => ({
          ...prev,
          pumkApplications: prev.pumkApplications.map((a) =>
            a.id === appId ? { ...a, status: nextStatus, fieldSurveyDone: true } : a
          ),
          pumkLoans: [newLoan, ...prev.pumkLoans],
          sbrDatabase: upsertSbrList(prev.sbrDatabase, app.nik, `${app.applicantName} (${app.businessName})`, app.location, 'Ring 1', {
            year: 2026,
            programName: `Pendanaan UMK (${contractNo})`,
            type: 'Pinjaman PUMK',
            amount: app.recommendedPlafon,
            status: 'Aktif / Lancar'
          })
        }),
        { module: 'Koperasi & PUMK', action: `Akad e-Sign & pencairan pinjaman ke VA ${vaNumber}`, objectRef: contractNo }
      );
      showToast(`Pinjaman ${contractNo} cair, tercatat di Portofolio, SBR & data/snapshot.json.`);
    } else {
      commitMutation(
        (prev) => ({
          ...prev,
          pumkApplications: prev.pumkApplications.map((a) =>
            a.id === appId ? { ...a, status: nextStatus, fieldSurveyDone: nextIdx >= 2 ? true : a.fieldSurveyDone } : a
          )
        }),
        { module: 'Koperasi & PUMK', action: `Tahap permohonan -> ${nextStatus}`, objectRef: app.regNo }
      );
      showToast(`Permohonan ${app.regNo} diperbarui (${nextStatus}) di data/snapshot.json.`);
    }
  };

  const payPumkInstallment = (loanId: string) => {
    const loan = snapshotRef.current.pumkLoans.find((l) => l.id === loanId);
    if (!loan) return;
    const nextRemaining = Math.max(0, loan.remainingPrincipal - loan.monthlyInstallment);
    commitMutation(
      (prev) => ({
        ...prev,
        pumkLoans: prev.pumkLoans.map((l) =>
          l.id === loanId
            ? {
                ...l,
                remainingPrincipal: nextRemaining,
                paidInstallments: l.paidInstallments + 1,
                dpd: 0,
                collectibility: 'Lancar',
                lastPaymentDate: '27 Nov 2026 (VA Bank)',
                collectionAssigned: false
              }
            : l
        )
      }),
      { module: 'Koperasi & PUMK', action: `Rekonsiliasi pembayaran angsuran VA Rp ${loan.monthlyInstallment.toLocaleString('id-ID')}`, objectRef: loan.contractNo }
    );
    showToast(`Pembayaran angsuran ${loan.contractNo} tercatat di data/snapshot.json.`);
  };

  const assignPumkCollection = (loanId: string) => {
    const loan = snapshotRef.current.pumkLoans.find((l) => l.id === loanId);
    if (!loan) return;
    commitMutation(
      (prev) => ({
        ...prev,
        pumkLoans: prev.pumkLoans.map((l) => (l.id === loanId ? { ...l, collectionAssigned: true } : l))
      }),
      { module: 'Koperasi & PUMK', action: `Penugasan kunjungan Field Collection & blast WA pengingat`, objectRef: loan.contractNo }
    );
    showToast(`Tugas Field Collection untuk ${loan.borrowerName} tersimpan ke snapshot JSON.`, 'info');
  };

  const restructurePumkLoan = (loanId: string) => {
    const loan = snapshotRef.current.pumkLoans.find((l) => l.id === loanId);
    if (!loan) return;
    commitMutation(
      (prev) => ({
        ...prev,
        pumkLoans: prev.pumkLoans.map((l) =>
          l.id === loanId
            ? {
                ...l,
                tenorMonths: l.tenorMonths + 12,
                monthlyInstallment: Math.round(l.monthlyInstallment * 0.7),
                dpd: 0,
                collectibility: 'Pemantauan'
              }
            : l
        )
      }),
      { module: 'Koperasi & PUMK', action: `Restrukturisasi tenor (+12 bln) & penyesuaian angsuran`, objectRef: loan.contractNo }
    );
    showToast(`Restrukturisasi ${loan.contractNo} tersimpan ke data/snapshot.json.`);
  };

  const importPumkLoansBatch = (items: PumkLoan[]) => {
    commitMutation(
      (prev) => ({ ...prev, pumkLoans: [...items, ...prev.pumkLoans] }),
      { module: 'Import Data', action: `Migrasi/Impor ${items.length} portofolio pinjaman PUMK (MCOS/PDC)`, objectRef: `IMP-PUMK-${items.length}` }
    );
    showToast(`${items.length} pinjaman PUMK berhasil dimigrasi ke data/snapshot.json.`);
  };

  // --- Module 4: Monev & Closed-Loop ---
  const addMonevIssue = (issue: Omit<MonevIssue, 'id' | 'ticketNo'>) => {
    const prefix = issue.source === 'Grievance Masyarakat' ? 'GRV' : 'MNE';
    const ticketNo = `${prefix}-2026-${String(snapshotRef.current.monevIssues.length + 1).padStart(3, '0')}`;
    commitMutation(
      (prev) => ({ ...prev, monevIssues: [{ ...issue, id: `iss-${Date.now()}`, ticketNo }, ...prev.monevIssues] }),
      { module: 'Monitoring & Evaluasi', action: `Pencatatan tiket baru (${issue.source})`, objectRef: ticketNo }
    );
    showToast(`Tiket ${ticketNo} tersimpan ke data/snapshot.json.`);
  };

  const updateMonevIssueStatus = (id: string, status: MonevIssue['status']) => {
    const iss = snapshotRef.current.monevIssues.find((i) => i.id === id);
    commitMutation(
      (prev) => ({
        ...prev,
        monevIssues: prev.monevIssues.map((i) =>
          i.id === id ? { ...i, status, slaDaysRemaining: status === 'Selesai Verifikasi' ? 0 : i.slaDaysRemaining } : i
        )
      }),
      { module: 'Monitoring & Evaluasi', action: `Update status tindak lanjut -> ${status}`, objectRef: iss?.ticketNo || id }
    );
    showToast(`Tiket ${iss?.ticketNo} diperbarui (${status}) di data/snapshot.json.`);
  };

  const addLessonLearned = (lesson: Omit<LessonLearned, 'id' | 'appliedToRkap'>) => {
    const item: LessonLearned = { ...lesson, id: `ls-${Date.now()}`, appliedToRkap: false };
    commitMutation(
      (prev) => ({ ...prev, lessonsLearned: [item, ...prev.lessonsLearned] }),
      { module: 'Evaluasi Dampak', action: `Pencatatan evaluasi OECD-DAC & Lessons Learned`, objectRef: lesson.sourceProgram }
    );
    showToast('Lessons learned tersimpan ke data/snapshot.json.');
  };

  const applyLessonToRkap = (lessonId: string) => {
    const lesson = snapshotRef.current.lessonsLearned.find((l) => l.id === lessonId);
    if (!lesson || lesson.appliedToRkap) return;
    const code = `RKA-2027-${String(snapshotRef.current.rkapList.length + 1).padStart(3, '0')}`;
    const newRkap: RkapItem = {
      id: `rka-cl-${Date.now()}`,
      code,
      title: `[Closed-Loop] ${lesson.recommendation.slice(0, 68)}`,
      pillar: lesson.pillar,
      sdgs: ['SDG 8', 'SDG 17'],
      location: 'Wilayah Operasi Ring 1 (Replikasi)',
      ring: 'Ring 1',
      budget: 900000000,
      committedBudget: 0,
      realizedBudget: 0,
      priorityScore: 86,
      status: 'Draft',
      version: 'v1.0 (Dari Monev)',
      kpiTarget: 'Mengacu benchmark hasil evaluasi tahun sebelumnya',
      baseline: `Lessons learned dari ${lesson.sourceProgram}`,
      synergyPartner: 'Pemda & Mitra Lokal',
      fromLessonId: lesson.id,
      theoryOfChange: {
        input: 'Alokasi anggaran replikasi praktik baik',
        activity: lesson.recommendation,
        output: 'Implementasi program terstandar berdasarkan temuan evaluasi',
        outcome: 'Peningkatan efektivitas & dampak dibanding siklus tahun lalu',
        impact: 'Pemberdayaan masyarakat berkelanjutan (Closed-Loop Learning)',
        riskSafeguard: `Mitigasi berdasarkan temuan: ${lesson.finding}`
      }
    };
    commitMutation(
      (prev) => ({
        ...prev,
        rkapList: [newRkap, ...prev.rkapList],
        lessonsLearned: prev.lessonsLearned.map((l) => (l.id === lessonId ? { ...l, appliedToRkap: true } : l))
      }),
      { module: 'Closed-Loop Learning', action: `Konversi Lessons Learned Monev ke Draft RKAP (${code})`, objectRef: lesson.id },
      true
    );
    showToast(`Rekomendasi Monev menjadi Draft RKAP ${code} & tersimpan di data/snapshot.json!`);
  };

  // --- Supporting Modules ---
  const importSbrBatch = (items: SbrBeneficiary[]) => {
    commitMutation(
      (prev) => {
        const existingNiks = new Set(prev.sbrDatabase.map((p) => p.nik));
        const uniqueNew = items.filter((item) => !existingNiks.has(item.nik));
        return { ...prev, sbrDatabase: [...uniqueNew, ...prev.sbrDatabase] };
      },
      { module: 'Import Data (SBR)', action: `Migrasi & deduplikasi ${items.length} penerima manfaat ke SBR`, objectRef: `IMP-SBR-${items.length}` }
    );
    showToast(`Migrasi data SBR tersimpan permanen ke data/snapshot.json.`);
  };

  const toggleSbrBlacklist = (nik: string, reason = 'Pelanggaran penyalahgunaan bantuan / temuan audit') => {
    commitMutation(
      (prev) => ({
        ...prev,
        sbrDatabase: prev.sbrDatabase.map((b) =>
          b.nik === nik ? { ...b, isBlacklisted: !b.isBlacklisted, blacklistReason: !b.isBlacklisted ? reason : undefined } : b
        )
      }),
      { module: 'Registry Penerima (SBR)', action: `Ubah status blacklist penerima`, objectRef: nik }
    );
    showToast(`Status blacklist NIK ${nik} diperbarui di data/snapshot.json.`, 'warning');
  };

  const importPartnersBatch = (items: PartnerVendor[]) => {
    commitMutation(
      (prev) => ({ ...prev, partners: [...items, ...prev.partners] }),
      { module: 'Import Data (Mitra)', action: `Impor ${items.length} data mitra pelaksana / vendor`, objectRef: `IMP-MTR-${items.length}` }
    );
    showToast(`${items.length} data mitra pelaksana tersimpan ke data/snapshot.json.`);
  };

  const togglePartnerBlacklist = (id: string) => {
    const p = snapshotRef.current.partners.find((x) => x.id === id);
    commitMutation(
      (prev) => ({
        ...prev,
        partners: prev.partners.map((item) =>
          item.id === id
            ? {
                ...item,
                isBlacklisted: !item.isBlacklisted,
                dueDiligenceStatus: !item.isBlacklisted ? 'Ditolak' : 'Lulus Verifikasi'
              }
            : item
        )
      }),
      { module: 'Manajemen Mitra', action: `Ubah status blacklist rekanan`, objectRef: p?.code || id }
    );
    showToast(`Status mitra ${p?.name} diperbarui di data/snapshot.json.`, 'warning');
  };

  const updateScoringRubric = (rubric: ScoringRubricCriterion[]) => {
    commitMutation(
      (prev) => ({ ...prev, scoringRubric: rubric }),
      { module: 'Konfigurasi Sistem', action: `Perbarui bobot rubrik scoring tanpa coding`, objectRef: 'RUBRIK-8.1' }
    );
    showToast('Bobot rubrik penilaian tersimpan permanen ke data/snapshot.json.');
  };

  const updateApprovalMatrix = (matrix: ApprovalMatrixRule[]) => {
    commitMutation(
      (prev) => ({ ...prev, approvalMatrix: matrix }),
      { module: 'Konfigurasi Sistem', action: `Perbarui matriks kewenangan persetujuan nominal`, objectRef: 'MATRIKS-LAMPIRAN-B' }
    );
    showToast('Matriks kewenangan persetujuan tersimpan ke data/snapshot.json.');
  };

  return (
    <AppStateContext.Provider
      value={{
        userRole,
        setUserRole,
        toast,
        showToast,
        clearToast,
        snapshot,
        snapshotMeta: snapshot.meta,
        syncStatus,
        downloadSnapshotJson,
        restoreSnapshotJson,
        resetSnapshotToSeed,
        monthlyBudgetData: snapshot.monthlyBudgetData,
        pillarDistributionData: snapshot.pillarDistributionData,
        regionalDistributionData: snapshot.regionalDistributionData,
        pumkNplTrendData: snapshot.pumkNplTrendData,
        socialMapping: snapshot.socialMapping,
        rkapList: snapshot.rkapList,
        scoringRubric: snapshot.scoringRubric,
        approvalMatrix: snapshot.approvalMatrix,
        proposals: snapshot.proposals,
        projects: snapshot.projects,
        charities: snapshot.charities,
        flagships: snapshot.flagships,
        pumkApplications: snapshot.pumkApplications,
        pumkLoans: snapshot.pumkLoans,
        cooperatives: snapshot.cooperatives,
        umkCatalog: snapshot.umkCatalog,
        monevIndicators: snapshot.monevIndicators,
        monevIssues: snapshot.monevIssues,
        lessonsLearned: snapshot.lessonsLearned,
        sbrDatabase: snapshot.sbrDatabase,
        partners: snapshot.partners,
        programAssets: snapshot.programAssets,
        risks: snapshot.risks,
        auditLogs: snapshot.auditLogs,
        addSocialMappingRegions,
        addRkapItems,
        advanceRkapStatus,
        convertRkapToProject,
        submitProposal,
        importProposalsBatch,
        saveProposalScore,
        decideProposalCommittee,
        approveProposalFinal,
        convertProposalToExecution,
        advanceProjectProgress,
        completeProjectBast,
        addCharityItem,
        advanceCharityStatus,
        updateFlagshipPerformance,
        advanceFlagshipTier,
        submitPumkApplication,
        advancePumkApplication,
        payPumkInstallment,
        assignPumkCollection,
        restructurePumkLoan,
        importPumkLoansBatch,
        addMonevIssue,
        updateMonevIssueStatus,
        addLessonLearned,
        applyLessonToRkap,
        importSbrBatch,
        toggleSbrBlacklist,
        importPartnersBatch,
        togglePartnerBlacklist,
        updateScoringRubric,
        updateApprovalMatrix,
        logAction,
        getApproverByAmount
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
