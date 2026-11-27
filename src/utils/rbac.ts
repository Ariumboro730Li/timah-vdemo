import { NavView, UserRole, RkapItem, CharityItem, ImportDatasetType } from '../types';

export type ApproverLevel = 'Kabid' | 'Kepala Divisi' | 'Direksi / Komite';

export interface RolePolicy {
  role: UserRole;
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
