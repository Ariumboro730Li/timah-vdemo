export type NavView =
  | 'dashboard'
  | 'portal'
  | 'perencanaan'
  | 'seleksi'
  | 'implementasi'
  | 'flagship'
  | 'pumk'
  | 'monev'
  | 'sbr'
  | 'import'
  | 'integrasi';

export type UserRole =
  | 'direksi'
  | 'kadiv'
  | 'perencanaan'
  | 'implementasi'
  | 'pumk'
  | 'monev'
  | 'spi'
  | 'sysadmin'
  | 'pemohon';

export interface SocialMappingRegion {
  id: string;
  region: string;
  district: string;
  ring: 'Ring 1' | 'Ring 2' | 'Ring 3';
  population: number;
  povertyRate: number;
  umkCount: number;
  priorityNeeds: string;
  stakeholderPosition: 'Tinggi-Tinggi (Kelola Erat)' | 'Tinggi-Rendah (Jaga Kepuasan)' | 'Rendah-Tinggi (Informasikan)';
  productionContext: string;
  dataSource: 'BPS / Podes' | 'DTSEN' | 'Survei Lapangan';
  geotagCoord: string;
}

export interface TheoryOfChange {
  input: string;
  activity: string;
  output: string;
  outcome: string;
  impact: string;
  riskSafeguard: string;
}

export interface RkapItem {
  id: string;
  code: string;
  title: string;
  pillar: 'Ekonomi' | 'Sosial' | 'Lingkungan' | 'Hukum & Tata Kelola';
  sdgs: string[];
  location: string;
  ring: 'Ring 1' | 'Ring 2' | 'Ring 3';
  budget: number;
  committedBudget: number;
  realizedBudget: number;
  priorityScore: number;
  status: 'Draft' | 'Review Kabid' | 'Review Kadiv' | 'Disetujui Direksi';
  version: string;
  kpiTarget: string;
  baseline: string;
  synergyPartner: string;
  theoryOfChange: TheoryOfChange;
  convertedToImpl?: boolean;
  fromLessonId?: string;
}

export interface ScoringRubricCriterion {
  id: string;
  key: string;
  name: string;
  description: string;
  weight: number;
  mandatory?: boolean;
}

export interface ApprovalMatrixRule {
  id: string;
  label: string;
  maxAmount: number | null;
  reviewer: string;
  approver: string;
}

export interface ReviewerScoreEntry {
  reviewerName: string;
  date: string;
  totalScore: number;
  notes: string;
}

export interface ProposalItem {
  id: string;
  ticketNo: string;
  applicant: string;
  nik: string;
  legalityNo: string;
  channel: 'Portal Web/Mobile' | 'Aplikasi TEO' | 'Surat OCR' | 'Fast-Track Darurat' | 'Import Batch';
  programType: 'Program PPM' | 'Bantuan Charity' | 'Program Flagship';
  category: string;
  requestedAmount: number;
  rabAnomalyFlag?: string;
  location: string;
  ring: 'Ring 1' | 'Ring 2' | 'Ring 3';
  sbrStatus: 'Unik (Bersih)' | 'Terverifikasi' | 'Duplikasi Terdeteksi' | 'Blacklist';
  nlpSimilarityPercent: number;
  adminScreeningStatus: 'Lolos' | 'Gugur' | 'Menunggu';
  reviewerScores: ReviewerScoreEntry[];
  score?: number;
  recommendation: 'Prioritas Disetujui' | 'Layak Bersyarat' | 'Ditolak' | 'Menunggu Review';
  committeeDecision: 'Belum Rapat' | 'Disetujui Komite' | 'Disetujui Bersyarat' | 'Ditolak';
  approvalStatus: 'Menunggu' | 'Disetujui' | 'Ditolak';
  convertedToImpl?: boolean;
  dateSubmitted: string;
  geotagCoord?: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  targetDate: string;
  weightPercent: number;
  status: 'Selesai' | 'Berjalan' | 'Tertunda';
}

export interface ProjectItem {
  id: string;
  spkNo: string;
  sourceRkapCode?: string;
  sourceProposalTicket?: string;
  title: string;
  partner: string;
  pillar: string;
  location: string;
  geotagCoord: string;
  contractValue: number;
  realizedValue: number;
  currentTerm: string;
  sapPoNo: string;
  sapStatus: 'Posted' | 'Pending Approval' | 'Settled';
  geotagPhotos: number;
  qrAttendanceCount: number;
  progressPercent: number;
  ragStatus: 'Hijau' | 'Kuning' | 'Merah';
  milestones: ProjectMilestone[];
  changeRequests: number;
  lpjStatus: 'Belum' | 'Review' | 'Terverifikasi';
  bastSigned: boolean;
  exitStrategy: string;
}

export interface CharityItem {
  id: string;
  ticketNo: string;
  applicant: string;
  nik: string;
  accountNo: string;
  category: 'Bencana' | 'Keagamaan' | 'Pendidikan' | 'Kesehatan' | 'Sarana Umum';
  isFastTrack: boolean;
  requestedAmount: number;
  location: string;
  geotagCoord: string;
  conflictOfInterestDeclared: boolean;
  fraudFlags: string[];
  approverLevel: 'Kabid' | 'Kepala Divisi' | 'Direksi / Komite';
  disbursementStatus: 'Verifikasi' | 'Menunggu Persetujuan' | 'Cair ke Penerima' | 'BAST Selesai';
  bastNo?: string;
  dateSubmitted: string;
}

export interface FlagshipPerformanceScores {
  output: number; // 25%
  outcome: number; // 35%
  efficiency: number; // 15%
  governance: number; // 15%
  satisfaction: number; // 10%
}

export interface FlagshipProgram {
  id: string;
  code: string;
  name: string;
  pillar: string;
  location: string;
  geotagCoord: string;
  period: string;
  theoryOfChange: string;
  baselineSummary: string;
  kpiTargetSummary: string;
  investmentCost: number;
  socialBenefitValue: number;
  sroiRatio: number;
  jobsCreated: number;
  beneficiaries: number;
  performanceScores: FlagshipPerformanceScores;
  ragStatus: 'Hijau' | 'Kuning' | 'Merah';
  graduationTier: 'Pemula' | 'Berkembang' | 'Mandiri' | 'Naik Kelas';
  collaborators: string[];
  successStory: string;
}

export interface PumkApplication {
  id: string;
  regNo: string;
  applicantName: string;
  businessName: string;
  nik: string;
  nibOrAhu: string;
  businessType: string;
  location: string;
  geotagCoord: string;
  requestedPlafon: number;
  tenorMonths: number;
  fiveC: {
    character: number;
    capacity: number;
    capital: number;
    condition: number;
    collateral: number;
  };
  creditScore: number;
  recommendedPlafon: number;
  fieldSurveyDone: boolean;
  status: 'Onboarding' | 'Survei Lapangan' | 'Komite Pendanaan' | 'Disetujui & Cair' | 'Ditolak';
}

export interface PumkLoan {
  id: string;
  contractNo: string;
  vaNumber: string;
  borrowerName: string;
  nik?: string;
  businessType: string;
  location?: string;
  geotagCoord?: string;
  ceiling: number;
  remainingPrincipal: number;
  monthlyInstallment: number;
  tenorMonths: number;
  paidInstallments: number;
  dpd: number;
  collectibility: 'Lancar' | 'Pemantauan' | 'Kurang Lancar' | 'Diragukan' | 'Macet';
  creditScore: number;
  lastPaymentDate: string;
  graduationStatus: 'Pemula' | 'Berkembang' | 'Mandiri' | 'Bankable / KUR';
  collectionAssigned?: boolean;
}

export interface CooperativeItem {
  id: string;
  code: string;
  name: string;
  ahuNo: string;
  location: string;
  memberCount: number;
  capital: number;
  ratCompliant: boolean;
  shuLastYear: number;
  healthScore: number;
  healthCategory: 'Sehat' | 'Cukup Sehat' | 'Dalam Pengawasan';
  digitalBookkeeping: boolean;
  strengtheningPlan: string;
}

export interface UmkCatalogItem {
  id: string;
  businessName: string;
  productName: string;
  category: string;
  priceRange: string;
  location: string;
  certification: string;
  offTakerMatch: string;
}

export interface MonevIndicator {
  id: string;
  code: string;
  programName: string;
  indicatorName: string;
  unit: string;
  baseline: string;
  target: string;
  actual: string;
  achievementPercent: number;
  frequency: 'Bulanan' | 'Triwulanan' | 'Semesteran';
  pic: string;
  ragStatus: 'Hijau' | 'Kuning' | 'Merah';
}

export interface MonevIssue {
  id: string;
  ticketNo: string;
  programTitle: string;
  location: string;
  category: 'Deviasi Fisik' | 'Keterlambatan Anggaran' | 'Keluhan Warga (Grievance)' | 'Kualitas Mutu';
  description: string;
  pic: string;
  deadline: string;
  status: 'Dalam Investigasi' | 'Dalam Perbaikan' | 'Selesai Verifikasi' | 'Ditolak';
  slaDaysRemaining: number;
  geotagCoord: string;
  source: 'Monev Lapangan' | 'Survei Penerima' | 'Grievance Masyarakat';
  recommendation?: string;
}

export interface LessonLearned {
  id: string;
  year: number;
  sourceProgram: string;
  pillar: 'Ekonomi' | 'Sosial' | 'Lingkungan' | 'Hukum & Tata Kelola';
  oecdDac: {
    relevance: number;
    coherence: number;
    effectiveness: number;
    efficiency: number;
    impact: number;
    sustainability: number;
  };
  finding: string;
  recommendation: string;
  appliedToRkap: boolean;
}

export interface SbrBeneficiary {
  nik: string;
  npwpOrNib?: string;
  name: string;
  address: string;
  ring?: 'Ring 1' | 'Ring 2' | 'Ring 3';
  programHistory: {
    year: number;
    programName: string;
    type: string;
    amount: number;
    status: string;
  }[];
  isBlacklisted: boolean;
  blacklistReason?: string;
  graduationStatus: 'Pemula' | 'Berkembang' | 'Mandiri' | 'Selesai LPJ';
}

export interface PartnerVendor {
  id: string;
  code: string;
  name: string;
  type: 'LSM' | 'Perguruan Tinggi' | 'Konsultan' | 'Kelompok Masyarakat' | 'Vendor';
  legalityNo: string;
  dueDiligenceStatus: 'Lulus Verifikasi' | 'Dalam Review' | 'Ditolak';
  performanceScore: number;
  activeContracts: number;
  isBlacklisted: boolean;
}

export interface ProgramAsset {
  id: string;
  assetCode: string;
  assetName: string;
  programTitle: string;
  recipientCommunity: string;
  bastNo: string;
  handoverDate: string;
  value: number;
  location: string;
  geotagCoord: string;
  condition: 'Baik' | 'Perlu Perawatan' | 'Rusak Ringan';
  maintenanceSchedule: string;
}

export interface RiskItem {
  id: string;
  code: string;
  programName: string;
  category: 'Sosial' | 'Lingkungan' | 'Reputasi' | 'Fraud / COI' | 'Kredit PUMK';
  description: string;
  level: 'Rendah' | 'Menengah' | 'Tinggi';
  mitigation: string;
  status: 'Terkendali' | 'Dipantau' | 'Eskalasi';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  module: string;
  action: string;
  objectRef: string;
  ipAddress: string;
}

export type ImportDatasetType =
  | 'social_mapping'
  | 'rkap'
  | 'proposal'
  | 'sbr'
  | 'pumk'
  | 'mitra';

export interface SnapshotMeta {
  version: string;
  revision: number;
  updatedAt: string;
  lastOperation: string;
}

export interface AppSnapshot {
  meta: SnapshotMeta;
  monthlyBudgetData: { month: string; target: number; realisasi: number; commitment: number }[];
  pillarDistributionData: { name: string; value: number; color: string }[];
  regionalDistributionData: { region: string; budget: number; projects: number }[];
  pumkNplTrendData: { month: string; npl: number; collectionRate: number }[];
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
}
