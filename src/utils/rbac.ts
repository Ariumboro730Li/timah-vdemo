import { NavView, UserRole, RkapItem, CharityItem, ImportDatasetType } from '../types';

export type ApproverLevel = 'Kabid' | 'Kepala Divisi' | 'Direksi / Komite';

export interface RolePolicy {
  role: UserRole;
  flowOrder: number;
  flowCategory: 'business' | 'support';
  flowPhaseBadge: string;
  flowNote: string;
  nextRoleHint: string;
  label: string;
  shortName: string;
  subtitle: string;
  initials: string;
  dashboardLevel: string;
  scopeSummary: string;
  allowedViews: NavView[];
  defaultView: NavView;
  allowedImportTypes: ImportDatasetType[];
  // Data Privacy (UU PDP Bab 12)
  canViewUnmaskedPii: boolean;
  // Header utilities
  canUseQuickSbr: boolean;
  canUseQuickImport: boolean;
  canViewSnapshotPill: boolean;
  // Module Permissions
  canCreateRkap: boolean;
  canConvertRkap: boolean;
  canScoreProposal: boolean;
  canCommitteeDecide: boolean;
  canConvertProposal: boolean;
  canManagePpm: boolean;
  canCreateCharity: boolean;
  canVerifyCharity: boolean;
  canCompleteCharityBast: boolean;
  canScoreFlagship: boolean;
  canAdvanceFlagshipTier: boolean;
  canCreatePumk: boolean;
  canAdvancePumkOnboarding: boolean;
  canManagePumkLoan: boolean;
  canManageMonevIssues: boolean;
  canApplyClosedLoop: boolean;
  canExportReports: boolean;
  canToggleSbrBlacklist: boolean;
  canTogglePartnerBlacklist: boolean;
  canManageConfig: boolean;
  canManageSnapshot: boolean;
  canExportAudit: boolean;
  isReadOnlyAudit?: boolean;
}

export const ROLE_POLICIES: Record<UserRole, RolePolicy> = {
  direksi: {
    role: 'direksi',
    flowOrder: 6,
    flowCategory: 'business',
    flowPhaseBadge: 'Tahap 6 · Pengesahan Akhir',
    flowNote: 'Pengesahan tertinggi (e-Sign): setujui RKAP tahap Direksi, putuskan forum Komite, & approve proposal/charity nominal > Rp 100 Jt.',
    nextRoleHint: 'Otomatis masuk Implementasi (SPK/Charity) lalu dievaluasi Tim Monev',
    label: 'Direksi (Eksekutif)',
    shortName: 'Dewan Direksi',
    subtitle: 'Eksekutif Korporat',
    initials: 'DR',
    dashboardLevel: 'Level Eksekutif (Direksi & Pengambil Keputusan Strategis)',
    scopeSummary: 'Pemantauan eksekutif, persetujuan akhir RKAP tahap Direksi, dan persetujuan proposal/charity > Rp 100 Jt.',
    allowedViews: ['dashboard', 'perencanaan', 'seleksi', 'implementasi', 'flagship', 'pumk', 'monev', 'sbr'],
    defaultView: 'dashboard',
    allowedImportTypes: [],
    canViewUnmaskedPii: false,
    canUseQuickSbr: true,
    canUseQuickImport: false,
    canViewSnapshotPill: false,
    canCreateRkap: false,
    canConvertRkap: false,
    canScoreProposal: false,
    canCommitteeDecide: true,
    canConvertProposal: false,
    canManagePpm: false,
    canCreateCharity: false,
    canVerifyCharity: false,
    canCompleteCharityBast: false,
    canScoreFlagship: false,
    canAdvanceFlagshipTier: false,
    canCreatePumk: false,
    canAdvancePumkOnboarding: false,
    canManagePumkLoan: false,
    canManageMonevIssues: false,
    canApplyClosedLoop: false,
    canExportReports: true,
    canToggleSbrBlacklist: false,
    canTogglePartnerBlacklist: false,
    canManageConfig: false,
    canManageSnapshot: false,
    canExportAudit: false
  },
  kadiv: {
    role: 'kadiv',
    flowOrder: 5,
    flowCategory: 'business',
    flowPhaseBadge: 'Tahap 5 · Komite & Approval',
    flowNote: 'Putuskan rapat Komite Seleksi, approve RKAP tahap Kadiv, sahkan bantuan nominal > Rp 20–100 Jt, serta kendali penuh Divisi CSR.',
    nextRoleHint: 'Direksi (jika > Rp 100 Jt / RKAP akhir) atau Bidang Implementasi (eksekusi)',
    label: 'Kepala Divisi CSR (Eksekutif)',
    shortName: 'Kepala Divisi CSR',
    subtitle: 'PT Timah Tbk',
    initials: 'KD',
    dashboardLevel: 'Level Eksekutif (Kepala Divisi CSR — Accountable)',
    scopeSummary: 'Pengendalian menyeluruh Divisi CSR, persetujuan RKAP tahap Kadiv, keputusan Komite, dan persetujuan bantuan Rp 20–100 Jt.',
    allowedViews: ['dashboard', 'portal', 'perencanaan', 'seleksi', 'implementasi', 'flagship', 'pumk', 'monev', 'sbr', 'import', 'integrasi'],
    defaultView: 'dashboard',
    allowedImportTypes: ['social_mapping', 'rkap', 'proposal', 'sbr', 'pumk', 'mitra'],
    canViewUnmaskedPii: false,
    canUseQuickSbr: true,
    canUseQuickImport: true,
    canViewSnapshotPill: true,
    canCreateRkap: true,
    canConvertRkap: true,
    canScoreProposal: true,
    canCommitteeDecide: true,
    canConvertProposal: true,
    canManagePpm: true,
    canCreateCharity: true,
    canVerifyCharity: true,
    canCompleteCharityBast: false,
    canScoreFlagship: true,
    canAdvanceFlagshipTier: true,
    canCreatePumk: false,
    canAdvancePumkOnboarding: true,
    canManagePumkLoan: false,
    canManageMonevIssues: true,
    canApplyClosedLoop: true,
    canExportReports: true,
    canToggleSbrBlacklist: true,
    canTogglePartnerBlacklist: true,
    canManageConfig: true,
    canManageSnapshot: false,
    canExportAudit: true
  },
  perencanaan: {
    role: 'perencanaan',
    flowOrder: 2,
    flowCategory: 'business',
    flowPhaseBadge: 'Tahap 2 · Perencanaan & RKAP',
    flowNote: 'Susun Social Mapping & Draft RKAP tahunan (top-down), lakukan Review Kabid RKAP, turunkan RKAP ke proyek PPM, & terima Closed-Loop Monev.',
    nextRoleHint: 'Kepala Divisi CSR (Review Kadiv RKAP) & Bidang Implementasi',
    label: 'Bidang Perencanaan (Manajerial)',
    shortName: 'Bidang Perencanaan',
    subtitle: 'Divisi CSR',
    initials: 'BP',
    dashboardLevel: 'Level Manajerial (Bidang Perencanaan CSR & RKAP)',
    scopeSummary: 'Fokus pada Social Mapping, Draft RKAP, Review Kabid Perencanaan, Simulasi What-If, Flagship SROI, dan Closed-Loop Monev.',
    allowedViews: ['dashboard', 'perencanaan', 'flagship', 'monev', 'import'],
    defaultView: 'perencanaan',
    allowedImportTypes: ['social_mapping', 'rkap'],
    canViewUnmaskedPii: false,
    canUseQuickSbr: false,
    canUseQuickImport: true,
    canViewSnapshotPill: false,
    canCreateRkap: true,
    canConvertRkap: true,
    canScoreProposal: false,
    canCommitteeDecide: false,
    canConvertProposal: false,
    canManagePpm: false,
    canCreateCharity: false,
    canVerifyCharity: false,
    canCompleteCharityBast: false,
    canScoreFlagship: true,
    canAdvanceFlagshipTier: false,
    canCreatePumk: false,
    canAdvancePumkOnboarding: false,
    canManagePumkLoan: false,
    canManageMonevIssues: false,
    canApplyClosedLoop: true,
    canExportReports: true,
    canToggleSbrBlacklist: false,
    canTogglePartnerBlacklist: false,
    canManageConfig: false,
    canManageSnapshot: false,
    canExportAudit: false
  },
  implementasi: {
    role: 'implementasi',
    flowOrder: 3,
    flowCategory: 'business',
    flowPhaseBadge: 'Tahap 3 · Seleksi & Eksekusi',
    flowNote: 'Screening & scoring proposal masuk, approve nominal ≤ Rp 20 Jt (Kabid), jalankan proyek SPK PPM (termin SAP & BAST), serta penyaluran Charity.',
    nextRoleHint: 'Kepala Divisi CSR / Direksi (Komite & > Rp 20 Jt), lalu Tim Monev',
    label: 'Bidang Implementasi (Operasional)',
    shortName: 'Bidang Implementasi',
    subtitle: 'Divisi CSR',
    initials: 'BI',
    dashboardLevel: 'Level Operasional (Bidang Implementasi PPM & Charity)',
    scopeSummary: 'Screening & scoring proposal, persetujuan Kabid (≤ Rp 20 Jt), eksekusi SPK PPM, Bantuan Charity/Darurat, Flagship, & SBR/Mitra.',
    allowedViews: ['dashboard', 'portal', 'seleksi', 'implementasi', 'flagship', 'sbr', 'monev', 'import'],
    defaultView: 'implementasi',
    allowedImportTypes: ['proposal', 'sbr', 'mitra'],
    canViewUnmaskedPii: true,
    canUseQuickSbr: true,
    canUseQuickImport: true,
    canViewSnapshotPill: false,
    canCreateRkap: false,
    canConvertRkap: false,
    canScoreProposal: true,
    canCommitteeDecide: false,
    canConvertProposal: true,
    canManagePpm: true,
    canCreateCharity: true,
    canVerifyCharity: true,
    canCompleteCharityBast: true,
    canScoreFlagship: true,
    canAdvanceFlagshipTier: true,
    canCreatePumk: false,
    canAdvancePumkOnboarding: false,
    canManagePumkLoan: false,
    canManageMonevIssues: true,
    canApplyClosedLoop: false,
    canExportReports: true,
    canToggleSbrBlacklist: false,
    canTogglePartnerBlacklist: true,
    canManageConfig: false,
    canManageSnapshot: false,
    canExportAudit: false
  },
  pumk: {
    role: 'pumk',
    flowOrder: 4,
    flowCategory: 'business',
    flowPhaseBadge: 'Tahap 4 · Jalur PUMK 5C',
    flowNote: 'Jalur paralel pembiayaan UMK: scoring, onboarding 5C, survei lapangan, akad & pencairan pinjaman VA, collection, restrukturisasi & koperasi.',
    nextRoleHint: 'Kepala Divisi CSR (Komite Pendanaan PUMK) & Tim Monev',
    label: 'Bidang Koperasi & PUMK (Operasional)',
    shortName: 'Bidang Koperasi & PUMK',
    subtitle: 'Divisi CSR',
    initials: 'BK',
    dashboardLevel: 'Level Operasional (Bidang Koperasi & Pendanaan PUMK)',
    scopeSummary: 'Pengelolaan penuh Onboarding 5C, Portofolio Pinjaman PUMK, Virtual Account, Collection, Restrukturisasi, Koperasi, & validasi SBR.',
    allowedViews: ['dashboard', 'seleksi', 'pumk', 'sbr', 'import'],
    defaultView: 'pumk',
    allowedImportTypes: ['pumk', 'sbr'],
    canViewUnmaskedPii: true,
    canUseQuickSbr: true,
    canUseQuickImport: true,
    canViewSnapshotPill: false,
    canCreateRkap: false,
    canConvertRkap: false,
    canScoreProposal: true,
    canCommitteeDecide: false,
    canConvertProposal: false,
    canManagePpm: false,
    canCreateCharity: false,
    canVerifyCharity: false,
    canCompleteCharityBast: false,
    canScoreFlagship: false,
    canAdvanceFlagshipTier: false,
    canCreatePumk: true,
    canAdvancePumkOnboarding: true,
    canManagePumkLoan: true,
    canManageMonevIssues: false,
    canApplyClosedLoop: false,
    canExportReports: true,
    canToggleSbrBlacklist: false,
    canTogglePartnerBlacklist: false,
    canManageConfig: false,
    canManageSnapshot: false,
    canExportAudit: false
  },
  monev: {
    role: 'monev',
    flowOrder: 7,
    flowCategory: 'business',
    flowPhaseBadge: 'Tahap 7 · Evaluasi & Dampak',
    flowNote: 'Tindak lanjuti temuan lapangan & aduan (Grievance SLA), skor Flagship & SROI, evaluasi OECD-DAC, ekspor laporan TJSL/GRI, & Closed-Loop ke RKAP.',
    nextRoleHint: 'SPI & Manajemen Risiko (audit akhir) + umpan balik ke Bidang Perencanaan',
    label: 'Tim Monev (Evaluasi)',
    shortName: 'Tim Monev & Evaluasi',
    subtitle: 'Divisi CSR',
    initials: 'MV',
    dashboardLevel: 'Level Evaluasi & Pengawasan Progres (Tim Monev)',
    scopeSummary: 'Pengelolaan Action Tracker & Grievance SLA, Indicator Library, Evaluasi OECD-DAC, SROI Flagship, serta pantau Read-Only Implementasi/PUMK.',
    allowedViews: ['dashboard', 'implementasi', 'flagship', 'pumk', 'monev', 'sbr'],
    defaultView: 'monev',
    allowedImportTypes: [],
    canViewUnmaskedPii: false,
    canUseQuickSbr: true,
    canUseQuickImport: false,
    canViewSnapshotPill: false,
    canCreateRkap: false,
    canConvertRkap: false,
    canScoreProposal: false,
    canCommitteeDecide: false,
    canConvertProposal: false,
    canManagePpm: false,
    canCreateCharity: false,
    canVerifyCharity: false,
    canCompleteCharityBast: false,
    canScoreFlagship: true,
    canAdvanceFlagshipTier: false,
    canCreatePumk: false,
    canAdvancePumkOnboarding: false,
    canManagePumkLoan: false,
    canManageMonevIssues: true,
    canApplyClosedLoop: true,
    canExportReports: true,
    canToggleSbrBlacklist: false,
    canTogglePartnerBlacklist: false,
    canManageConfig: false,
    canManageSnapshot: false,
    canExportAudit: false
  },
  spi: {
    role: 'spi',
    flowOrder: 8,
    flowCategory: 'business',
    flowPhaseBadge: 'Akhir Alur · Audit Independen',
    flowNote: 'Penutup siklus tata kelola (Read-Only operasional / Segregation of Duties): audit Audit Trail, Risk Register, Blacklist anti-fraud & ekspor bukti SPI.',
    nextRoleHint: 'Siklus bisnis & audit selesai terdokumentasi',
    label: 'SPI & Manajemen Risiko (Audit)',
    shortName: 'Auditor SPI & MR',
    subtitle: 'Pengawasan Internal',
    initials: 'SP',
    dashboardLevel: 'Level Pengawasan Independen (SPI & Manajemen Risiko — Read-Only)',
    scopeSummary: 'Inspeksi independen seluruh modul (Read-Only), pengendalian Risk Register & Anti-Fraud/Blacklist, serta ekspor Audit Trail SPI.',
    allowedViews: ['dashboard', 'perencanaan', 'seleksi', 'implementasi', 'flagship', 'pumk', 'monev', 'sbr', 'integrasi'],
    defaultView: 'integrasi',
    allowedImportTypes: [],
    canViewUnmaskedPii: true,
    canUseQuickSbr: true,
    canUseQuickImport: false,
    canViewSnapshotPill: true,
    canCreateRkap: false,
    canConvertRkap: false,
    canScoreProposal: false,
    canCommitteeDecide: false,
    canConvertProposal: false,
    canManagePpm: false,
    canCreateCharity: false,
    canVerifyCharity: false,
    canCompleteCharityBast: false,
    canScoreFlagship: false,
    canAdvanceFlagshipTier: false,
    canCreatePumk: false,
    canAdvancePumkOnboarding: false,
    canManagePumkLoan: false,
    canManageMonevIssues: false,
    canApplyClosedLoop: false,
    canExportReports: true,
    canToggleSbrBlacklist: true,
    canTogglePartnerBlacklist: true,
    canManageConfig: false,
    canManageSnapshot: false,
    canExportAudit: true,
    isReadOnlyAudit: true
  },
  sysadmin: {
    role: 'sysadmin',
    flowOrder: 9,
    flowCategory: 'support',
    flowPhaseBadge: 'Pendukung TI · Non-Approval',
    flowNote: 'Pengelola teknis sistem di luar persetujuan bisnis: kelola RBAC, konfigurasi rubrik no-code, integrasi 8 API, import migrasi & Snapshot JSON.',
    nextRoleHint: 'Menjaga infrastruktur, keamanan & data seluruh peran berjalan stabil',
    label: 'System Admin (TI)',
    shortName: 'System Admin (TI)',
    subtitle: 'Divisi ICT / Pengelola Sistem',
    initials: 'TI',
    dashboardLevel: 'Level Administrasi Sistem & Tata Kelola TI (KAK RACI #17–18)',
    scopeSummary: 'Administrasi RBAC & keamanan, integrasi API, konfigurasi rubrik no-code, migrasi/import master data, serta kelola Snapshot JSON.',
    allowedViews: ['dashboard', 'sbr', 'import', 'integrasi'],
    defaultView: 'integrasi',
    allowedImportTypes: ['social_mapping', 'rkap', 'proposal', 'sbr', 'pumk', 'mitra'],
    canViewUnmaskedPii: true,
    canUseQuickSbr: true,
    canUseQuickImport: true,
    canViewSnapshotPill: true,
    canCreateRkap: false,
    canConvertRkap: false,
    canScoreProposal: false,
    canCommitteeDecide: false,
    canConvertProposal: false,
    canManagePpm: false,
    canCreateCharity: false,
    canVerifyCharity: false,
    canCompleteCharityBast: false,
    canScoreFlagship: false,
    canAdvanceFlagshipTier: false,
    canCreatePumk: false,
    canAdvancePumkOnboarding: false,
    canManagePumkLoan: false,
    canManageMonevIssues: false,
    canApplyClosedLoop: false,
    canExportReports: true,
    canToggleSbrBlacklist: true,
    canTogglePartnerBlacklist: true,
    canManageConfig: true,
    canManageSnapshot: true,
    canExportAudit: true
  },
  pemohon: {
    role: 'pemohon',
    flowOrder: 1,
    flowCategory: 'business',
    flowPhaseBadge: 'Mulai · Pengajuan Pemohon',
    flowNote: 'Titik awal alur proposal: ajukan proposal bantuan online di Portal, pantau progres tiket (Track & Trace), & kirim pengaduan (Grievance).',
    nextRoleHint: 'Bidang Implementasi (screening & scoring proposal masuk)',
    label: 'Publik / Pemohon Portal',
    shortName: 'Portal Pemohon / Mitra',
    subtitle: 'Akses Eksternal (Anonim)',
    initials: 'PM',
    dashboardLevel: 'Level Publik / Stakeholder (Data Teragregasi & Anonim — UU PDP)',
    scopeSummary: 'Hanya mengakses Ringkasan Publik Anonim, Portal Pengajuan Online, Pelacakan Status Tiket, E-Katalog UMK, dan Kanal Pengaduan.',
    allowedViews: ['dashboard', 'portal'],
    defaultView: 'portal',
    allowedImportTypes: [],
    canViewUnmaskedPii: false,
    canUseQuickSbr: false,
    canUseQuickImport: false,
    canViewSnapshotPill: false,
    canCreateRkap: false,
    canConvertRkap: false,
    canScoreProposal: false,
    canCommitteeDecide: false,
    canConvertProposal: false,
    canManagePpm: false,
    canCreateCharity: false,
    canVerifyCharity: false,
    canCompleteCharityBast: false,
    canScoreFlagship: false,
    canAdvanceFlagshipTier: false,
    canCreatePumk: false,
    canAdvancePumkOnboarding: false,
    canManagePumkLoan: false,
    canManageMonevIssues: false,
    canApplyClosedLoop: false,
    canExportReports: false,
    canToggleSbrBlacklist: false,
    canTogglePartnerBlacklist: false,
    canManageConfig: false,
    canManageSnapshot: false,
    canExportAudit: false
  }
};

export function getRolePolicy(role: UserRole): RolePolicy {
  return ROLE_POLICIES[role];
}

export function isViewAllowed(role: UserRole, view: NavView): boolean {
  return ROLE_POLICIES[role].allowedViews.includes(view);
}

// --- Authority Matrix Helpers (KAK Lampiran B & RKAP P-09) ---

export function getRkapApprovalPermission(
  role: UserRole,
  currentStatus: RkapItem['status']
): { allowed: boolean; requiredRoleLabel: string; nextLabel: string } {
  if (currentStatus === 'Draft') {
    return {
      allowed: role === 'perencanaan',
      requiredRoleLabel: 'Bidang Perencanaan (Kabid)',
      nextLabel: 'Ajukan Review Kabid'
    };
  }
  if (currentStatus === 'Review Kabid') {
    return {
      allowed: role === 'kadiv',
      requiredRoleLabel: 'Kepala Divisi CSR',
      nextLabel: 'Setujui Kadiv (e-Sign)'
    };
  }
  if (currentStatus === 'Review Kadiv') {
    return {
      allowed: role === 'direksi',
      requiredRoleLabel: 'Direksi (Eksekutif)',
      nextLabel: 'Sahkan Direksi (e-Sign)'
    };
  }
  return {
    allowed: false,
    requiredRoleLabel: 'Sudah Disetujui Direksi',
    nextLabel: 'Selesai'
  };
}

export function canRoleApproveByAuthority(role: UserRole, requiredApprover: ApproverLevel): boolean {
  if (requiredApprover === 'Kabid') {
    return role === 'implementasi' || role === 'pumk' || role === 'perencanaan';
  }
  if (requiredApprover === 'Kepala Divisi') {
    return role === 'kadiv';
  }
  if (requiredApprover === 'Direksi / Komite') {
    return role === 'direksi';
  }
  return false;
}

export function getCharityActionPermission(
  role: UserRole,
  charity: Pick<CharityItem, 'disbursementStatus' | 'approverLevel'>
): { allowed: boolean; actionLabel: string; lockedReason: string } {
  const policy = ROLE_POLICIES[role];
  if (charity.disbursementStatus === 'Verifikasi') {
    return {
      allowed: policy.canVerifyCharity,
      actionLabel: 'Loloskan Verifikasi',
      lockedReason: 'Kewenangan Bidang Implementasi / Kadiv'
    };
  }
  if (charity.disbursementStatus === 'Menunggu Persetujuan') {
    const allowed = canRoleApproveByAuthority(role, charity.approverLevel);
    return {
      allowed,
      actionLabel: `Setujui & Cairkan (${charity.approverLevel})`,
      lockedReason: `Kewenangan ${charity.approverLevel}`
    };
  }
  if (charity.disbursementStatus === 'Cair ke Penerima') {
    return {
      allowed: policy.canCompleteCharityBast,
      actionLabel: 'Selesaikan BAST',
      lockedReason: 'Kewenangan Bidang Implementasi'
    };
  }
  return {
    allowed: false,
    actionLabel: 'Selesai',
    lockedReason: 'BAST Selesai'
  };
}

// --- UU PDP Sensitive Data Masking (KAK Bab 12) ---

export function maskNik(nik: string | undefined, role: UserRole): string {
  if (!nik) return '-';
  if (ROLE_POLICIES[role].canViewUnmaskedPii) return nik;
  const clean = nik.trim();
  if (clean.length < 10) return '******';
  return `${clean.slice(0, 6)}******${clean.slice(-4)}`;
}

export function maskAccountNo(accountNo: string | undefined, role: UserRole): string {
  if (!accountNo) return '-';
  if (ROLE_POLICIES[role].canViewUnmaskedPii) return accountNo;
  // Mask digit sequences >= 6 characters while keeping bank name & last 4 digits readable
  return accountNo.replace(/\d[\d-]{5,}\d/g, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length <= 4) return '****';
    return `****-****-${digits.slice(-4)}`;
  });
}

export function maskVaNumber(va: string | undefined, role: UserRole): string {
  if (!va) return '-';
  if (ROLE_POLICIES[role].canViewUnmaskedPii) return va;
  const clean = va.trim();
  if (clean.length <= 6) return '******';
  return `${clean.slice(0, 6)}****${clean.slice(-4)}`;
}

export const ALL_ROLES_ORDER: UserRole[] = [
  'pemohon',
  'perencanaan',
  'implementasi',
  'pumk',
  'kadiv',
  'direksi',
  'monev',
  'spi',
  'sysadmin'
];

export type ActiveJourney = 'proposal' | 'rkap' | 'pumk';

export const JOURNEY_ORDER: ActiveJourney[] = ['proposal', 'rkap', 'pumk'];

export interface RoleJourneyStep {
  role: UserRole;
  stepLabel: string;
  defaultView: NavView;
  note: string;
  nextHint: string;
}

export interface JourneyDefinition {
  id: ActiveJourney;
  label: string;
  shortLabel: string;
  description: string;
  allowedViews: NavView[];
  steps: RoleJourneyStep[];
}

export const ROLE_JOURNEY_PRESETS: Record<ActiveJourney, JourneyDefinition> = {
  proposal: {
    id: 'proposal',
    label: 'Alur Proposal',
    shortLabel: 'Proposal',
    description: 'Fokus penuh pada pengajuan proposal masyarakat, seleksi & scoring, komite & approval, eksekusi SPK PPM / Charity & BAST, SBR/Aset, Monev, hingga Audit SPI.',
    allowedViews: ['dashboard', 'portal', 'seleksi', 'implementasi', 'sbr', 'monev', 'integrasi'],
    steps: [
      {
        role: 'pemohon',
        stepLabel: 'Mulai · Ajukan Proposal',
        defaultView: 'portal',
        note: 'Pemohon isi formulir di /portal. Sistem langsung cek NIK di SBR & simpan ke snapshot.json.',
        nextHint: 'Bidang Implementasi (scoring di /seleksi-proposal)'
      },
      {
        role: 'implementasi',
        stepLabel: 'Scoring & Eksekusi Lapangan',
        defaultView: 'seleksi',
        note: 'Beri nilai rubrik proposal, approve jika ≤ Rp 20 Jt, serta jalankan SPK PPM / Charity & BAST setelah disetujui.',
        nextHint: 'Kepala Divisi CSR (Rapat Komite & approval > Rp 20–100 Jt)'
      },
      {
        role: 'kadiv',
        stepLabel: 'Keputusan Komite & Approval',
        defaultView: 'seleksi',
        note: 'Putuskan "Setujui Rapat Komite" & klik Approve e-Sign untuk proposal nominal > Rp 20–100 Jt.',
        nextHint: 'Direksi (jika > Rp 100 Jt) atau kembali ke Bidang Implementasi'
      },
      {
        role: 'direksi',
        stepLabel: 'Pengesahan Nominal > Rp 100 Jt',
        defaultView: 'seleksi',
        note: 'Klik Approve e-Sign untuk proposal strategis > Rp 100 Jt; otomatis membentuk SPK PPM / Tiket Charity.',
        nextHint: 'Bidang Implementasi (pencairan termin & BAST) lalu Tim Monev'
      },
      {
        role: 'monev',
        stepLabel: 'Evaluasi Dampak & Grievance',
        defaultView: 'monev',
        note: 'Pantau realisasi lapangan, tindak lanjuti aduan pemohon, & evaluasi dampak OECD-DAC.',
        nextHint: 'SPI & Manajemen Risiko (audit akhir)'
      },
      {
        role: 'spi',
        stepLabel: 'Akhir · Audit Independen SPI',
        defaultView: 'integrasi',
        note: 'Inspeksi independen Read-Only terhadap Audit Trail, Risk Register, & pengendalian Blacklist anti-fraud.',
        nextHint: 'Siklus proposal & audit selesai'
      }
    ]
  },
  rkap: {
    id: 'rkap',
    label: 'Alur RKAP',
    shortLabel: 'RKAP',
    description: 'Fokus penuh pada penyusunan Social Mapping & Draft RKAP top-down, persetujuan berjenjang hingga Direksi, penurunan ke SPK PPM, Aset BAST, Monev Closed-Loop & Audit SPI.',
    allowedViews: ['dashboard', 'perencanaan', 'implementasi', 'sbr', 'monev', 'integrasi'],
    steps: [
      {
        role: 'perencanaan',
        stepLabel: 'Mulai · Draft RKAP & Review Kabid',
        defaultView: 'perencanaan',
        note: 'Input Social Mapping & Draft RKAP di /perencanaan, ajukan Review Kabid, lalu turunkan ke proyek PPM setelah disahkan.',
        nextHint: 'Kepala Divisi CSR (Setujui Kadiv)'
      },
      {
        role: 'kadiv',
        stepLabel: 'Persetujuan Kadiv CSR',
        defaultView: 'perencanaan',
        note: 'Tinjau pagu & sebaran zona Ring 1–3, lalu klik "Setujui Kadiv (e-Sign)" pada item RKAP.',
        nextHint: 'Direksi (Pengesahan Akhir RKAP)'
      },
      {
        role: 'direksi',
        stepLabel: 'Pengesahan RKAP Direksi',
        defaultView: 'perencanaan',
        note: 'Klik "Sahkan Direksi (e-Sign)" sebagai persetujuan final pagu anggaran tahunan.',
        nextHint: 'Bidang Perencanaan / Implementasi (Turunkan ke SPK PPM)'
      },
      {
        role: 'implementasi',
        stepLabel: 'Eksekusi SPK PPM & BAST',
        defaultView: 'implementasi',
        note: 'Jalankan proyek SPK PPM turunan RKAP di /implementasi, verifikasi termin SAP, hingga BAST & catat aset.',
        nextHint: 'Tim Monev (Evaluasi & Closed-Loop)'
      },
      {
        role: 'monev',
        stepLabel: 'Evaluasi & Closed-Loop RKAP',
        defaultView: 'monev',
        note: 'Ukur ketercapaian KPI & OECD-DAC, lalu konversi rekomendasi Lessons Learned kembali menjadi Draft RKAP tahun depan.',
        nextHint: 'SPI (Audit) & kembali ke Bidang Perencanaan'
      },
      {
        role: 'spi',
        stepLabel: 'Akhir · Audit Kepatuhan RKAP',
        defaultView: 'integrasi',
        note: 'Verifikasi kepatuhan realisasi terhadap pagu RKAP & telusuri log e-Sign pada Audit Trail.',
        nextHint: 'Siklus RKAP & audit selesai'
      }
    ]
  },
  pumk: {
    id: 'pumk',
    label: 'Alur PUMK',
    shortLabel: 'PUMK',
    description: 'Fokus penuh pada pembiayaan UMK & Koperasi: Onboarding 5C, survei lapangan, komite pendanaan, akad & angsuran Virtual Account, validasi SBR, Monev & Audit Risiko SPI.',
    allowedViews: ['dashboard', 'pumk', 'sbr', 'monev', 'integrasi'],
    steps: [
      {
        role: 'pumk',
        stepLabel: 'Mulai · Onboarding 5C & Survei',
        defaultView: 'pumk',
        note: 'Input pengajuan PUMK 5C di /koperasi-pumk, verifikasi survei lapangan, serta kelola angsuran VA, collection & restrukturisasi.',
        nextHint: 'Kepala Divisi CSR (Komite Pendanaan)'
      },
      {
        role: 'kadiv',
        stepLabel: 'Komite Pendanaan & Persetujuan',
        defaultView: 'pumk',
        note: 'Tinjau hasil 5C & survei lapangan, lalu setujui akad pencairan pinjaman PUMK bersama Bidang PUMK.',
        nextHint: 'Bidang PUMK (monitoring angsuran VA) & Tim Monev'
      },
      {
        role: 'monev',
        stepLabel: 'Pantau Kolektibilitas & Dampak',
        defaultView: 'pumk',
        note: 'Pantau kesehatan portofolio PUMK (Read-Only), dampak ekonomi UMK binaan, & evaluasi keberlanjutan.',
        nextHint: 'SPI & Manajemen Risiko (audit portofolio)'
      },
      {
        role: 'spi',
        stepLabel: 'Akhir · Audit Risiko & Anti-Fraud',
        defaultView: 'integrasi',
        note: 'Audit risiko kredit macet (NPL), validitas SBR penerima PUMK, & kendalikan status Blacklist jika ada fraud.',
        nextHint: 'Siklus PUMK & audit selesai'
      }
    ]
  }
};

export function isRoleInJourney(role: UserRole, journey: ActiveJourney): boolean {
  return ROLE_JOURNEY_PRESETS[journey].steps.some((s) => s.role === role);
}

export function getJourneyFirstRole(journey: ActiveJourney): UserRole {
  return ROLE_JOURNEY_PRESETS[journey].steps[0].role;
}

export function isViewAllowedInJourney(role: UserRole, journey: ActiveJourney, view: NavView): boolean {
  const journeyViews = ROLE_JOURNEY_PRESETS[journey].allowedViews;
  return journeyViews.includes(view) && isViewAllowed(role, view);
}

export function getJourneyDefaultViewForRole(role: UserRole, journey: ActiveJourney): NavView {
  const step = ROLE_JOURNEY_PRESETS[journey].steps.find((s) => s.role === role);
  if (step && isViewAllowedInJourney(role, journey, step.defaultView)) {
    return step.defaultView;
  }
  const allowed = ROLE_JOURNEY_PRESETS[journey].allowedViews.find((v) => isViewAllowed(role, v));
  return allowed || ROLE_POLICIES[role].defaultView;
}

export const VIEW_LABELS: Record<NavView, string> = {
  dashboard: 'Dashboard',
  portal: 'Alur & Portal Pemohon',
  perencanaan: 'Perencanaan & RKAP',
  seleksi: 'Seleksi Proposal',
  implementasi: 'Implementasi & Charity',
  flagship: 'Program Flagship',
  pumk: 'Koperasi & PUMK',
  monev: 'Monitoring & Evaluasi',
  sbr: 'Registry, Mitra & Aset',
  import: 'Import & Migrasi Data',
  integrasi: 'Integrasi, Aturan & Audit'
};
