import {
  SocialMappingRegion,
  RkapItem,
  ScoringRubricCriterion,
  ApprovalMatrixRule,
  ProposalItem,
  ProjectItem,
  CharityItem,
  FlagshipProgram,
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

export const monthlyBudgetData = [
  { month: 'Jan', target: 3.5, realisasi: 3.2, commitment: 3.4 },
  { month: 'Feb', target: 7.2, realisasi: 6.8, commitment: 7.0 },
  { month: 'Mar', target: 11.5, realisasi: 10.9, commitment: 11.2 },
  { month: 'Apr', target: 16.0, realisasi: 15.1, commitment: 15.8 },
  { month: 'Mei', target: 20.8, realisasi: 19.5, commitment: 20.2 },
  { month: 'Jun', target: 25.5, realisasi: 24.1, commitment: 25.0 },
  { month: 'Jul', target: 30.2, realisasi: 28.6, commitment: 29.8 },
  { month: 'Agu', target: 35.0, realisasi: 33.2, commitment: 34.5 },
  { month: 'Sep', target: 39.8, realisasi: 37.9, commitment: 39.1 },
  { month: 'Okt', target: 44.5, realisasi: 42.1, commitment: 43.8 },
  { month: 'Nov', target: 48.5, realisasi: 46.2, commitment: 47.9 },
  { month: 'Des', target: 52.0, realisasi: 49.8, commitment: 51.5 }
];

export const pillarDistributionData = [
  { name: 'Pilar Ekonomi (PPM & PUMK)', value: 21.5, color: '#0284c7' },
  { name: 'Pilar Lingkungan (Reklamasi)', value: 14.8, color: '#16a34a' },
  { name: 'Pilar Sosial (Charity & Kes)', value: 11.2, color: '#f59e0b' },
  { name: 'Pilar Hukum & Tata Kelola', value: 4.5, color: '#6366f1' }
];

export const regionalDistributionData = [
  { region: 'Bangka Barat (Muntok)', budget: 14.2, projects: 16 },
  { region: 'Bangka Selatan (Toboali)', budget: 11.5, projects: 12 },
  { region: 'Bangka Tengah (Koba)', budget: 9.8, projects: 10 },
  { region: 'Belitung & Belitung Timur', budget: 10.4, projects: 11 },
  { region: 'Kepulauan Riau (Kundur)', budget: 6.1, projects: 7 }
];

export const pumkNplTrendData = [
  { month: 'Jul', npl: 2.9, collectionRate: 92.1 },
  { month: 'Agu', npl: 2.8, collectionRate: 93.4 },
  { month: 'Sep', npl: 2.6, collectionRate: 94.0 },
  { month: 'Okt', npl: 2.5, collectionRate: 94.8 },
  { month: 'Nov', npl: 2.4, collectionRate: 95.2 },
  { month: 'Des (Est)', npl: 2.2, collectionRate: 96.0 }
];

export const initialSocialMapping: SocialMappingRegion[] = [
  {
    id: 'sm1',
    region: 'Bangka Barat',
    district: 'Kec. Muntok & Belo Laut',
    ring: 'Ring 1',
    population: 52400,
    povertyRate: 6.4,
    umkCount: 615,
    priorityNeeds: 'Cold storage nelayan, diversifikasi olahan hasil laut, air bersih',
    stakeholderPosition: 'Tinggi-Tinggi (Kelola Erat)',
    productionContext: 'Area smelter & tambang laut aktif',
    dataSource: 'BPS / Podes',
    geotagCoord: '-2.0642, 105.1614'
  },
  {
    id: 'sm2',
    region: 'Bangka Selatan',
    district: 'Kec. Toboali & Sukadamai',
    ring: 'Ring 1',
    population: 68900,
    povertyRate: 7.1,
    umkCount: 540,
    priorityNeeds: 'Dermaga nelayan tradisional, permodalan PUMK, alat tangkap ramah lingkungan',
    stakeholderPosition: 'Tinggi-Tinggi (Kelola Erat)',
    productionContext: 'Area operasi laut selatan',
    dataSource: 'DTSEN',
    geotagCoord: '-3.0086, 106.4539'
  },
  {
    id: 'sm3',
    region: 'Bangka Tengah',
    district: 'Kec. Koba & Namang',
    ring: 'Ring 1',
    population: 44100,
    povertyRate: 5.8,
    umkCount: 412,
    priorityNeeds: 'Reklamasi agroforestry pasca tambang, budidaya madu kelulut & pelawan',
    stakeholderPosition: 'Tinggi-Tinggi (Kelola Erat)',
    productionContext: 'Lahan reklamasi & tambang darat',
    dataSource: 'BPS / Podes',
    geotagCoord: '-2.4877, 106.4055'
  },
  {
    id: 'sm4',
    region: 'Belitung Timur',
    district: 'Kec. Gantung & Manggar',
    ring: 'Ring 1',
    population: 38200,
    povertyRate: 6.2,
    umkCount: 488,
    priorityNeeds: 'Penguatan koperasi lada putih & nanas, digitalisasi pembukuan koperasi',
    stakeholderPosition: 'Tinggi-Rendah (Jaga Kepuasan)',
    productionContext: 'Wilayah eks-tambang & kemitraan',
    dataSource: 'Survei Lapangan',
    geotagCoord: '-2.9711, 108.1653'
  },
  {
    id: 'sm5',
    region: 'Kepulauan Riau',
    district: 'Pulau Kundur',
    ring: 'Ring 1',
    population: 31500,
    povertyRate: 6.9,
    umkCount: 295,
    priorityNeeds: 'Rehabilitasi mangrove, sarana air bersih dusun pesisir, beasiswa vokasi',
    stakeholderPosition: 'Tinggi-Tinggi (Kelola Erat)',
    productionContext: 'Unit Metalurgi & operasi laut Kundur',
    dataSource: 'BPS / Podes',
    geotagCoord: '0.7351, 103.4285'
  }
];

export const defaultScoringRubric: ScoringRubricCriterion[] = [
  { id: 'c1', key: 'admin', name: 'Kelengkapan Administrasi (TTD, Legalitas, Stempel, Rekomendasi)', description: 'Mandatory — gugur otomatis jika berkas legal tidak sah', weight: 10, mandatory: true },
  { id: 'c2', key: 'ring', name: 'Penerima Manfaat di Wilayah Operasi Perusahaan (Ring 1/2/3)', description: 'Prioritas kedekatan langsung dengan area operasi IUP/smelter', weight: 15 },
  { id: 'c3', key: 'sdgs', name: 'Tujuan Pembangunan Berkelanjutan / SDGs', description: 'Keselarasan terhadap indikator TPB/SDGs prioritas BUMN', weight: 10 },
  { id: 'c4', key: 'impact', name: 'Potensi Dampak Sosial-Ekonomi-Lingkungan (Outcome)', description: 'Kejelasan perubahan terukur pasca program berakhir', weight: 10 },
  { id: 'c5', key: 'synergy', name: 'Sinergi / Kolaborasi / Harmonisasi', description: 'Keterlibatan pemda, desa, dan lembaga setempat', weight: 10 },
  { id: 'c6', key: 'image', name: 'Corporate Image & Relasi Sosial', description: 'Kontribusi terhadap reputasi dan izin sosial operasi', weight: 10 },
  { id: 'c7', key: 'inclusive', name: 'Inklusivitas (Perempuan, Disabilitas, Kelompok Rentan)', description: 'Proporsi keterlibatan kelompok rentan sebagai penerima manfaat', weight: 10 },
  { id: 'c8', key: 'risk', name: 'Risiko & Kepatuhan (Legal, Sosial, Reputasi, Anti-COI)', description: 'Kepatuhan ISO 37001 dan bebas benturan kepentingan', weight: 10 },
  { id: 'c9', key: 'cofunding', name: 'Sinergi / Kolaborasi & Co-Funding', description: 'Dukungan swadaya masyarakat atau pendanaan mitra', weight: 5 },
  { id: 'c10', key: 'trackRecord', name: 'Realisasi & Kepatuhan Bantuan Sebelumnya', description: 'Rekam jejak pelaporan LPJ dan keberlanjutan program terdahulu', weight: 10 }
];

export const defaultApprovalMatrix: ApprovalMatrixRule[] = [
  { id: 'am1', label: '≤ Rp 20 Juta', maxAmount: 20000000, reviewer: 'Staf / Kepala Bidang', approver: 'Kepala Bidang' },
  { id: 'am2', label: '> Rp 20 Juta s.d. Rp 100 Juta', maxAmount: 100000000, reviewer: 'Kepala Bidang', approver: 'Kepala Divisi' },
  { id: 'am3', label: '> Rp 100 Juta', maxAmount: null, reviewer: 'Kepala Divisi', approver: 'Direksi / Komite' }
];

export const initialRkapList: RkapItem[] = [
  {
    id: '1',
    code: 'RKA-2026-001',
    title: 'Sentra Hilirisasi Nelayan & Cold Storage Pesisir Bangka Barat',
    pillar: 'Ekonomi',
    sdgs: ['SDG 8', 'SDG 14'],
    location: 'Muntok, Bangka Barat',
    ring: 'Ring 1',
    budget: 2400000000,
    committedBudget: 2100000000,
    realizedBudget: 1850000000,
    priorityScore: 89,
    status: 'Disetujui Direksi',
    version: 'v2.0 (Final)',
    kpiTarget: 'Pendapatan nelayan naik 35%, 140 nelayan terserap',
    baseline: 'Pendapatan rata-rata Rp 2,6 Jt/bln, kehilangan mutu ikan 22%',
    synergyPartner: 'Dinas Kelautan & Perikanan Bangka Barat',
    convertedToImpl: true,
    theoryOfChange: {
      input: 'Anggaran Rp 2,4 M, unit cold storage 10 ton, pendamping teknis perikanan',
      activity: 'Pembangunan fasilitas penyimpanan dingin, pelatihan manajemen koperasi pesisir',
      output: '1 unit sentra cold storage aktif, 6 kelompok nelayan terlatih',
      outcome: 'Penurunan susut mutu hasil tangkap < 5% & kenaikan margin jual 35%',
      impact: 'Kemandirian ekonomi pesisir Ring 1 yang tangguh dan berkelanjutan',
      riskSafeguard: 'Audit lingkungan limbah es, pencegahan konflik pembagian kuota antar kelompok'
    }
  },
  {
    id: '2',
    code: 'RKA-2026-002',
    title: 'Agroforestry & Pemulihan Ekosistem Lahan Bekas Tambang Timah',
    pillar: 'Lingkungan',
    sdgs: ['SDG 13', 'SDG 15'],
    location: 'Koba, Bangka Tengah',
    ring: 'Ring 1',
    budget: 1850000000,
    committedBudget: 1450000000,
    realizedBudget: 1120000000,
    priorityScore: 85,
    status: 'Disetujui Direksi',
    version: 'v1.2',
    kpiTarget: 'Rehabilitasi 45 Ha lahan hijau, 65 petani madu mandiri',
    baseline: '45 Ha lahan eks-tambang minim vegetasi produktif',
    synergyPartner: 'Pemkab Bangka Tengah & KPH Sungai Sembulan',
    convertedToImpl: false,
    theoryOfChange: {
      input: 'Bibit pelawan & buah produktif, koloni lebah kelulut, mentor agronomi',
      activity: 'Penanaman terpadu 45 Ha, pelatihan ternak madu & pengemasan',
      output: '45 Ha kawasan agroforestry, 150 stup lebah kelulut aktif',
      outcome: 'Tambahan penghasilan petani Rp 2,1 Jt/bln & tutupan hijau naik 60%',
      impact: 'Restorasi ekologi pasca tambang bernilai ekonomi sirkular',
      riskSafeguard: 'Pemantauan risiko kebakaran lahan musim kemarau & legalitas batas lahan'
    }
  },
  {
    id: '3',
    code: 'RKA-2026-003',
    title: 'Beasiswa Generasi Cemerlang Vokasi Tambang & Bahari',
    pillar: 'Sosial',
    sdgs: ['SDG 4', 'SDG 8'],
    location: 'Pangkalpinang & Belitung',
    ring: 'Ring 2',
    budget: 750000000,
    committedBudget: 400000000,
    realizedBudget: 0,
    priorityScore: 78,
    status: 'Review Kadiv',
    version: 'v1.1',
    kpiTarget: '120 pelajar lulus sertifikasi kompetensi siap kerja',
    baseline: 'Tingkat serapan lulusan SMK pesisir baru 42%',
    synergyPartner: 'SMKN Kelautan & Politeknik Manufaktur Babel',
    theoryOfChange: {
      input: 'Dana beasiswa, modul pelatihan keselamatan kerja & pengelasan',
      activity: 'Seleksi siswa keluarga prasejahtera, pelatihan vokasi & uji BNSP',
      output: '120 peserta menerima sertifikat kompetensi nasional',
      outcome: 'Serapan kerja lulusan meningkat di atas 75% dalam 6 bulan',
      impact: 'Peningkatan kualitas SDM lokal sekitar wilayah operasi perusahaan',
      riskSafeguard: 'Seleksi objektif anti-nepotisme dan verifikasi NIK SBR'
    }
  },
  {
    id: '4',
    code: 'RKA-2026-004',
    title: 'Pemberdayaan Koperasi Tani Nanas & Lada Putih Belitung',
    pillar: 'Ekonomi',
    sdgs: ['SDG 8', 'SDG 12'],
    location: 'Gantung, Belitung Timur',
    ring: 'Ring 1',
    budget: 1150000000,
    committedBudget: 980000000,
    realizedBudget: 920000000,
    priorityScore: 84,
    status: 'Disetujui Direksi',
    version: 'v2.0',
    kpiTarget: 'Omzet koperasi naik 40%, 3 produk tersertifikasi halal & PIRT',
    baseline: 'Penjualan komoditas mentah tanpa nilai tambah olahan',
    synergyPartner: 'Dinas Koperasi & UMKM Belitung Timur',
    theoryOfChange: {
      input: 'Mesin pengolah lada & selai nanas, pelatihan pembukuan digital',
      activity: 'Pendampingan RAT koperasi, kurasi kemasan, matchmaking off-taker',
      output: '1 rumah kemasan standar higienis, 45 petani binaan',
      outcome: 'Kenaikan harga jual produk olahan 45% dibanding bahan mentah',
      impact: 'Koperasi desa naik kelas dan layak pembiayaan perbankan (bankable)',
      riskSafeguard: 'Audit pencatatan keuangan koperasi berkala setiap triwulan'
    }
  },
  {
    id: '5',
    code: 'RKA-2026-005',
    title: 'Pembangunan Sarana Air Bersih Terpadu Dusun Pasir Panjang',
    pillar: 'Sosial',
    sdgs: ['SDG 6'],
    location: 'Kundur, Kep. Riau',
    ring: 'Ring 1',
    budget: 520000000,
    committedBudget: 0,
    realizedBudget: 0,
    priorityScore: 81,
    status: 'Review Kabid',
    version: 'v1.0',
    kpiTarget: '320 KK memiliki akses air bersih layak minum',
    baseline: 'Warga bergantung pada tadah hujan & sumur payau saat kemarau',
    synergyPartner: 'Pemerintah Kecamatan Kundur',
    theoryOfChange: {
      input: 'Instalasi filtrasi RO tenaga surya, jaringan pipa distribusi 2 km',
      activity: 'Konstruksi unit filtrasi & pembentukan kelompok pengelola air (KPSPAM)',
      output: '1 menara air & 320 sambungan rumah aktif',
      outcome: 'Penurunan biaya pembelian air rumah tangga 65% & kasus diare turun',
      impact: 'Peningkatan derajat kesehatan masyarakat pesisir Kundur',
      riskSafeguard: 'Uji lab kualitas air berkala dan iuran pemeliharaan mandiri warga'
    }
  }
];

export const initialProposalList: ProposalItem[] = [
  {
    id: 'p1',
    ticketNo: 'PROP-2026-104',
    applicant: 'Kelompok Tani Harapan Jaya (Desa Air Nyatoh)',
    nik: '1901042508820003',
    legalityNo: 'SK-KADES/014/2024',
    channel: 'Portal Web/Mobile',
    programType: 'Program PPM',
    category: 'Pemberdayaan Pertanian',
    requestedAmount: 85000000,
    location: 'Bangka Barat',
    ring: 'Ring 1',
    sbrStatus: 'Unik (Bersih)',
    nlpSimilarityPercent: 12,
    adminScreeningStatus: 'Lolos',
    reviewerScores: [
      { reviewerName: 'Dra. Ratna Wijaya', date: '25 Nov 2026', totalScore: 86.0, notes: 'Kelompok aktif di Ring 1 dengan rencana swadaya jelas' },
      { reviewerName: 'Hendra Saputra', date: '25 Nov 2026', totalScore: 87.0, notes: 'RAB wajar sesuai standar unit cost' }
    ],
    score: 86.5,
    recommendation: 'Prioritas Disetujui',
    committeeDecision: 'Disetujui Komite',
    approvalStatus: 'Disetujui',
    convertedToImpl: false,
    dateSubmitted: '24 Nov 2026',
    geotagCoord: '-2.0112, 105.2410'
  },
  {
    id: 'p2',
    ticketNo: 'PROP-2026-105',
    applicant: 'Yayasan Pendidikan Al-Ikhlas Belinyu',
    nik: '1901081105740002',
    legalityNo: 'AHU-0012984.AH.01.04',
    channel: 'Aplikasi TEO',
    programType: 'Bantuan Charity',
    category: 'Pendidikan',
    requestedAmount: 45000000,
    location: 'Bangka Induk',
    ring: 'Ring 2',
    sbrStatus: 'Terverifikasi',
    nlpSimilarityPercent: 18,
    adminScreeningStatus: 'Lolos',
    reviewerScores: [
      { reviewerName: 'Dra. Ratna Wijaya', date: '26 Nov 2026', totalScore: 72.0, notes: 'Perlu melengkapi rincian RAB material atap' }
    ],
    score: 72.0,
    recommendation: 'Layak Bersyarat',
    committeeDecision: 'Belum Rapat',
    approvalStatus: 'Menunggu',
    dateSubmitted: '25 Nov 2026',
    geotagCoord: '-1.6428, 105.7812'
  },
  {
    id: 'p3',
    ticketNo: 'PROP-2026-106',
    applicant: 'Koperasi Perikanan Maju Laut Batu Beriga',
    nik: '1904021908850001',
    legalityNo: 'AHU-0008812.AH.01.26',
    channel: 'Portal Web/Mobile',
    programType: 'Program PPM',
    category: 'Pengadaan Alat Tangkap Ramah Lingkungan',
    requestedAmount: 120000000,
    rabAnomalyFlag: 'Harga jaring 18% di atas benchmark katalog unit cost',
    location: 'Bangka Tengah',
    ring: 'Ring 1',
    sbrStatus: 'Unik (Bersih)',
    nlpSimilarityPercent: 24,
    adminScreeningStatus: 'Lolos',
    reviewerScores: [],
    recommendation: 'Menunggu Review',
    committeeDecision: 'Belum Rapat',
    approvalStatus: 'Menunggu',
    dateSubmitted: '26 Nov 2026',
    geotagCoord: '-2.6124, 106.7621'
  },
  {
    id: 'p4',
    ticketNo: 'PROP-2026-102',
    applicant: 'Panitia Pembangunan Musholla Al-Barokah',
    nik: '1901026607810004',
    legalityNo: 'SK-CAMAT/09/2025',
    channel: 'Surat OCR',
    programType: 'Bantuan Charity',
    category: 'Keagamaan',
    requestedAmount: 30000000,
    location: 'Pangkalpinang',
    ring: 'Ring 3',
    sbrStatus: 'Duplikasi Terdeteksi',
    nlpSimilarityPercent: 84,
    adminScreeningStatus: 'Gugur',
    reviewerScores: [
      { reviewerName: 'Sistem Otomatis (Knock-out)', date: '21 Nov 2026', totalScore: 52.0, notes: 'Terdeteksi duplikasi NIK penerima pada tahun anggaran 2025 & kemiripan proposal 84%' }
    ],
    score: 52.0,
    recommendation: 'Ditolak',
    committeeDecision: 'Ditolak',
    approvalStatus: 'Ditolak',
    dateSubmitted: '20 Nov 2026',
    geotagCoord: '-2.1316, 106.1169'
  }
];

export const initialProjectList: ProjectItem[] = [
  {
    id: 'prj1',
    spkNo: 'SPK/CSR/2026/041',
    sourceRkapCode: 'RKA-2026-001',
    title: 'Pembangunan Rumah Produksi Pakan Ikan Mandiri',
    partner: 'LPPM Universitas Bangka Belitung',
    pillar: 'Ekonomi',
    location: 'Muntok, Bangka Barat',
    geotagCoord: '-2.0642, 105.1614',
    contractValue: 350000000,
    realizedValue: 210000000,
    currentTerm: 'Termin 2 (60%)',
    sapPoNo: '450089121',
    sapStatus: 'Posted',
    geotagPhotos: 14,
    qrAttendanceCount: 64,
    progressPercent: 68,
    ragStatus: 'Hijau',
    changeRequests: 0,
    lpjStatus: 'Review',
    bastSigned: false,
    exitStrategy: 'Pengelolaan mandiri oleh Koperasi Nelayan Muntok mulai Q2 2027',
    milestones: [
      { id: 'm1', name: 'Assessment Baseline & Mobilisasi', targetDate: '15 Agu 2026', weightPercent: 25, status: 'Selesai' },
      { id: 'm2', name: 'Konstruksi & Instalasi Mesin Pelet', targetDate: '30 Okt 2026', weightPercent: 45, status: 'Selesai' },
      { id: 'm3', name: 'Pelatihan Produksi & Uji Mutu Pakan', targetDate: '15 Des 2026', weightPercent: 30, status: 'Berjalan' }
    ]
  },
  {
    id: 'prj2',
    spkNo: 'SPK/CSR/2026/048',
    sourceRkapCode: 'RKA-2026-004',
    title: 'Rumah Kemasan & Pengolahan Lada Putih Koperasi Gantung',
    partner: 'Koperasi Tani Sejahtera Belitung',
    pillar: 'Ekonomi',
    location: 'Gantung, Belitung Timur',
    geotagCoord: '-2.9711, 108.1653',
    contractValue: 225000000,
    realizedValue: 225000000,
    currentTerm: 'Pencairan Penuh (100%)',
    sapPoNo: '450089204',
    sapStatus: 'Settled',
    geotagPhotos: 19,
    qrAttendanceCount: 48,
    progressPercent: 100,
    ragStatus: 'Hijau',
    changeRequests: 1,
    lpjStatus: 'Terverifikasi',
    bastSigned: true,
    exitStrategy: 'Koperasi beroperasi penuh dengan skema off-taker ekspor lokal',
    milestones: [
      { id: 'm1', name: 'Renovasi Ruang Kemas Higienis', targetDate: '10 Jul 2026', weightPercent: 40, status: 'Selesai' },
      { id: 'm2', name: 'Pengadaan Mesin Grinder & Sealer', targetDate: '20 Sep 2026', weightPercent: 40, status: 'Selesai' },
      { id: 'm3', name: 'Sertifikasi Halal & Serah Terima BAST', targetDate: '10 Nov 2026', weightPercent: 20, status: 'Selesai' }
    ]
  },
  {
    id: 'prj3',
    spkNo: 'SPK/CSR/2026/052',
    sourceRkapCode: 'RKA-2026-003',
    title: 'Pelatihan Sertifikasi Pengelasan Kapal Nelayan',
    partner: 'Balai Latihan Kerja (BLK) Muntok',
    pillar: 'Sosial',
    location: 'Muntok, Bangka Barat',
    geotagCoord: '-2.0719, 105.1722',
    contractValue: 180000000,
    realizedValue: 54000000,
    currentTerm: 'Termin 1 (30%)',
    sapPoNo: '450089311',
    sapStatus: 'Pending Approval',
    geotagPhotos: 5,
    qrAttendanceCount: 30,
    progressPercent: 35,
    ragStatus: 'Kuning',
    changeRequests: 1,
    lpjStatus: 'Belum',
    bastSigned: false,
    exitStrategy: 'Penyaluran peserta lulus uji kompetensi ke galangan lokal & mitra',
    milestones: [
      { id: 'm1', name: 'Seleksi 30 Pemuda Ring 1', targetDate: '01 Okt 2026', weightPercent: 30, status: 'Selesai' },
      { id: 'm2', name: 'Pelatihan Praktik Las & K3', targetDate: '30 Nov 2026', weightPercent: 40, status: 'Tertunda' },
      { id: 'm3', name: 'Uji Sertifikasi BNSP & Penutupan', targetDate: '20 Des 2026', weightPercent: 30, status: 'Berjalan' }
    ]
  }
];

export const initialCharityList: CharityItem[] = [
  {
    id: 'ch1',
    ticketNo: 'CHR-2026-081',
    applicant: 'BPBD Kab. Bangka Barat (Tanggap Banjir)',
    nik: '1905011204790001',
    accountNo: '144-00-0912844-1 (Mandiri)',
    category: 'Bencana',
    isFastTrack: true,
    requestedAmount: 75000000,
    location: 'Kec. Muntok, Bangka Barat',
    geotagCoord: '-2.0604, 105.1588',
    conflictOfInterestDeclared: true,
    fraudFlags: [],
    approverLevel: 'Kepala Divisi',
    disbursementStatus: 'BAST Selesai',
    bastNo: 'BAST/CHR/2026/081',
    dateSubmitted: '18 Nov 2026'
  },
  {
    id: 'ch2',
    ticketNo: 'CHR-2026-084',
    applicant: 'Puskesmas Pembantu Pulau Dapur',
    nik: '1903020809840002',
    accountNo: '0112-01-004512-30-9 (BRI)',
    category: 'Kesehatan',
    isFastTrack: false,
    requestedAmount: 18500000,
    location: 'Toboali, Bangka Selatan',
    geotagCoord: '-3.1280, 106.5120',
    conflictOfInterestDeclared: true,
    fraudFlags: [],
    approverLevel: 'Kabid',
    disbursementStatus: 'Menunggu Persetujuan',
    dateSubmitted: '25 Nov 2026'
  },
  {
    id: 'ch3',
    ticketNo: 'CHR-2026-085',
    applicant: 'Panitia Renovasi Balai Warga Dusun Jaya',
    nik: '1901026607810004',
    accountNo: '0112-01-009821-50-2 (BRI)',
    category: 'Sarana Umum',
    isFastTrack: false,
    requestedAmount: 24000000,
    location: 'Pangkal Balam, Pangkalpinang',
    geotagCoord: '-2.1180, 106.1355',
    conflictOfInterestDeclared: false,
    fraudFlags: ['Pemohon berulang (NIK pernah terima 2025)', 'Deklarasi COI belum ditandatangani'],
    approverLevel: 'Kepala Divisi',
    disbursementStatus: 'Verifikasi',
    dateSubmitted: '26 Nov 2026'
  }
];

export const initialFlagshipList: FlagshipProgram[] = [
  {
    id: 'flg1',
    code: 'FLG-2025-01',
    name: 'Sentra Nelayan Mandiri Sukadamai',
    pillar: 'Ekonomi & Pesisir',
    location: 'Toboali, Bangka Selatan',
    geotagCoord: '-2.9812, 106.1245',
    period: '2025 – 2027 (Multi-Tahun)',
    theoryOfChange: 'Pemberian armada higienis & cold storage -> Susut mutu ikan turun & akses pasar luas -> Kemandirian ekonomi keluarga nelayan',
    baselineSummary: 'Pendapatan rata-rata Rp 2,4 Jt/bln; 0 fasilitas rantai dingin',
    kpiTargetSummary: 'Pendapatan naik ≥ 40%; 140 nelayan terserap; SROI ≥ 3,5',
    investmentCost: 1850000000,
    socialBenefitValue: 7215000000,
    sroiRatio: 3.90,
    jobsCreated: 142,
    beneficiaries: 380,
    performanceScores: { output: 92, outcome: 88, efficiency: 86, governance: 90, satisfaction: 91 },
    ragStatus: 'Hijau',
    graduationTier: 'Mandiri',
    collaborators: ['Pemkab Bangka Selatan', 'Univ. Bangka Belitung', 'Koperasi Nelayan Sukadamai'],
    successStory: 'Kelompok nelayan Sukadamai berhasil menembus pasokan rutin ikan segar ke pasar Pangkalpinang dan Jakarta dengan kenaikan omzet 48%.'
  },
  {
    id: 'flg2',
    code: 'FLG-2025-02',
    name: 'Reklamasi Hijau Madu Pelawan & Kelulut',
    pillar: 'Lingkungan & Ekonomi',
    location: 'Namang, Bangka Tengah',
    geotagCoord: '-2.4109, 106.2198',
    period: '2025 – 2027 (Multi-Tahun)',
    theoryOfChange: 'Rehabilitasi hutan pelawan pasca tambang -> Budidaya lebah kelulut -> Edu-wisata & produk madu bernilai tinggi',
    baselineSummary: 'Lahan bekas tambang 45 Ha kritis; pendapatan musiman petani',
    kpiTargetSummary: '45 Ha pulih produktif; 65 petani aktif; produksi 1.200 liter/tahun',
    investmentCost: 950000000,
    socialBenefitValue: 3420000000,
    sroiRatio: 3.60,
    jobsCreated: 65,
    beneficiaries: 185,
    performanceScores: { output: 85, outcome: 82, efficiency: 80, governance: 88, satisfaction: 87 },
    ragStatus: 'Hijau',
    graduationTier: 'Berkembang',
    collaborators: ['Pemkab Bangka Tengah', 'KPH Sungai Sembulan', 'Pokdarwis Namang'],
    successStory: 'Kawasan eks-tambang Namang kini menjadi destinasi edu-wisata hutan pelawan dan menghasilkan madu pahit khas Bangka bersertifikasi BPOM.'
  },
  {
    id: 'flg3',
    code: 'FLG-2024-03',
    name: 'Sentra Kerajinan Pewter Timah Heritage',
    pillar: 'Ekonomi Kreatif',
    location: 'Muntok, Bangka Barat',
    geotagCoord: '-2.0642, 105.1614',
    period: '2024 – 2026 (Multi-Tahun)',
    theoryOfChange: 'Pelatihan kriya pewter halus -> Bantuan cetakan modern & desain -> Kemitraan souvenir korporasi & pariwisata nasional',
    baselineSummary: '12 perajin rumahan dengan desain tradisional terbatas',
    kpiTargetSummary: '48 perajin tersertifikasi; omzet ekspor/korporat Rp 1,5 M/tahun',
    investmentCost: 650000000,
    socialBenefitValue: 1980000000,
    sroiRatio: 3.05,
    jobsCreated: 48,
    beneficiaries: 95,
    performanceScores: { output: 90, outcome: 86, efficiency: 84, governance: 85, satisfaction: 89 },
    ragStatus: 'Hijau',
    graduationTier: 'Naik Kelas',
    collaborators: ['Dekranasda Babel', 'ISI Yogyakarta', 'BUMN Pariwisata'],
    successStory: 'Kriya pewter Muntok resmi menjadi suvenir protokoler kementerian dan dipasarkan melalui galeri bandara nasional.'
  }
];

export const initialPumkApplications: PumkApplication[] = [
  {
    id: 'app1',
    regNo: 'REG-PUMK-2026-019',
    applicantName: 'Rizal Efendi',
    businessName: 'Usaha Pengolahan Kemplang Panggang Sejahtera',
    nik: '1901051408860002',
    nibOrAhu: 'NIB-0220109481234',
    businessType: 'Kuliner Olahan Ikan',
    location: 'Sungailiat, Bangka',
    geotagCoord: '-1.8562, 106.1190',
    requestedPlafon: 50000000,
    tenorMonths: 24,
    fiveC: { character: 88, capacity: 82, capital: 76, condition: 84, collateral: 80 },
    creditScore: 82.4,
    recommendedPlafon: 45000000,
    fieldSurveyDone: true,
    status: 'Komite Pendanaan'
  },
  {
    id: 'app2',
    regNo: 'REG-PUMK-2026-020',
    applicantName: 'Nurhayati',
    businessName: 'Tenun Cual & Batik Pesisir Belitung',
    nik: '1902015506810005',
    nibOrAhu: 'NIB-0220109551109',
    businessType: 'Kriya & Wastra',
    location: 'Tanjungpandan, Belitung',
    geotagCoord: '-2.7418, 107.6380',
    requestedPlafon: 35000000,
    tenorMonths: 24,
    fiveC: { character: 90, capacity: 78, capital: 74, condition: 82, collateral: 75 },
    creditScore: 80.1,
    recommendedPlafon: 35000000,
    fieldSurveyDone: false,
    status: 'Survei Lapangan'
  }
];

export const initialPumkLoans: PumkLoan[] = [
  {
    id: 'pumk1',
    contractNo: 'PUMK-2025-089',
    vaNumber: '887910023412',
    borrowerName: 'Kue & Otak-Otak Khas Bangka Ibu Maryam',
    nik: '1901014405780001',
    businessType: 'Kuliner Olahan Ikan',
    location: 'Pangkalpinang',
    geotagCoord: '-2.1316, 106.1169',
    ceiling: 40000000,
    remainingPrincipal: 18500000,
    monthlyInstallment: 1250000,
    tenorMonths: 36,
    paidInstallments: 19,
    dpd: 0,
    collectibility: 'Lancar',
    creditScore: 88,
    lastPaymentDate: '15 Nov 2026',
    graduationStatus: 'Bankable / KUR'
  },
  {
    id: 'pumk2',
    contractNo: 'PUMK-2025-112',
    vaNumber: '887910023588',
    borrowerName: 'Bengkel Bubut & Las Logam Perkasa',
    nik: '1905012203830004',
    businessType: 'Jasa Permesinan / Logam',
    location: 'Muntok, Bangka Barat',
    geotagCoord: '-2.0650, 105.1631',
    ceiling: 75000000,
    remainingPrincipal: 52000000,
    monthlyInstallment: 2400000,
    tenorMonths: 36,
    paidInstallments: 10,
    dpd: 0,
    collectibility: 'Lancar',
    creditScore: 82,
    lastPaymentDate: '20 Nov 2026',
    graduationStatus: 'Mandiri'
  },
  {
    id: 'pumk3',
    contractNo: 'PUMK-2025-045',
    vaNumber: '887910021094',
    borrowerName: 'Kerajinan Pewter Timah Muntok Art',
    nik: '1905011907760002',
    businessType: 'Kerajinan Khas Timah',
    location: 'Muntok, Bangka Barat',
    geotagCoord: '-2.0615, 105.1602',
    ceiling: 50000000,
    remainingPrincipal: 31200000,
    monthlyInstallment: 1650000,
    tenorMonths: 36,
    paidInstallments: 12,
    dpd: 18,
    collectibility: 'Pemantauan',
    creditScore: 68,
    lastPaymentDate: '02 Okt 2026',
    graduationStatus: 'Berkembang',
    collectionAssigned: false
  },
  {
    id: 'pumk4',
    contractNo: 'PUMK-2024-031',
    vaNumber: '887910019231',
    borrowerName: 'Budidaya Tambak Udang Vaname Lestari',
    nik: '1903011509800003',
    businessType: 'Perikanan Budidaya',
    location: 'Toboali, Bangka Selatan',
    geotagCoord: '-3.0112, 106.4581',
    ceiling: 100000000,
    remainingPrincipal: 68000000,
    monthlyInstallment: 3200000,
    tenorMonths: 36,
    paidInstallments: 10,
    dpd: 94,
    collectibility: 'Kurang Lancar',
    creditScore: 54,
    lastPaymentDate: '14 Agu 2026',
    graduationStatus: 'Pemula',
    collectionAssigned: true
  }
];

export const initialCooperatives: CooperativeItem[] = [
  {
    id: 'kop1',
    code: 'KOP-2025-01',
    name: 'Koperasi Nelayan Mandiri Sukadamai',
    ahuNo: 'AHU-0004129.AH.01.26',
    location: 'Toboali, Bangka Selatan',
    memberCount: 142,
    capital: 480000000,
    ratCompliant: true,
    shuLastYear: 96000000,
    healthScore: 86,
    healthCategory: 'Sehat',
    digitalBookkeeping: true,
    strengtheningPlan: 'Ekspansi gudang beku & rantai pasok antar pulau'
  },
  {
    id: 'kop2',
    code: 'KOP-2025-02',
    name: 'Koperasi Tani Lada Putih Sejahtera',
    ahuNo: 'AHU-0005920.AH.01.26',
    location: 'Gantung, Belitung Timur',
    memberCount: 94,
    capital: 310000000,
    ratCompliant: true,
    shuLastYear: 52000000,
    healthScore: 79,
    healthCategory: 'Cukup Sehat',
    digitalBookkeeping: true,
    strengtheningPlan: 'Digitalisasi pembukuan anggota & sertifikasi indikasi geografis'
  },
  {
    id: 'kop3',
    code: 'KOP-2025-03',
    name: 'Koperasi Serba Usaha Pesisir Kundur',
    ahuNo: 'AHU-0007182.AH.01.26',
    location: 'Kundur, Kep. Riau',
    memberCount: 68,
    capital: 165000000,
    ratCompliant: false,
    shuLastYear: 18000000,
    healthScore: 61,
    healthCategory: 'Dalam Pengawasan',
    digitalBookkeeping: false,
    strengtheningPlan: 'Pendampingan penyusunan RAT & pembenahan tata kelola pengurus'
  }
];

export const initialUmkCatalog: UmkCatalogItem[] = [
  { id: 'cat1', businessName: 'Otak-Otak Ibu Maryam', productName: 'Kemplang & Otak-Otak Ikan Tenggiri Vakum', category: 'Kuliner', priceRange: 'Rp 35.000 - Rp 85.000', location: 'Pangkalpinang', certification: 'Halal MUI & PIRT', offTakerMatch: 'Galeri Bandara Depati Amir' },
  { id: 'cat2', businessName: 'Madu Pelawan Namang', productName: 'Madu Pahit Pelawan & Kelulut Organik 500ml', category: 'Agribisnis', priceRange: 'Rp 150.000 - Rp 280.000', location: 'Bangka Tengah', certification: 'BPOM & Halal', offTakerMatch: 'Retail Modern & Hotel Nasional' },
  { id: 'cat3', businessName: 'Muntok Pewter Art', productName: 'Plakat & Miniatur Kapal Keruk Pewter Timah', category: 'Kriya', priceRange: 'Rp 250.000 - Rp 1.800.000', location: 'Bangka Barat', certification: 'SNI Kerajinan', offTakerMatch: 'Suvenir Protokoler BUMN' }
];

export const initialMonevIndicators: MonevIndicator[] = [
  { id: 'ind1', code: 'KPI-EC-01', programName: 'Sentra Nelayan Mandiri Sukadamai', indicatorName: 'Kenaikan pendapatan rata-rata nelayan binaan', unit: '%', baseline: '0%', target: '35%', actual: '42%', achievementPercent: 120, frequency: 'Semesteran', pic: 'Bidang Perencanaan', ragStatus: 'Hijau' },
  { id: 'ind2', code: 'KPI-EN-02', programName: 'Reklamasi Hijau Madu Pelawan', indicatorName: 'Luas lahan pasca tambang terehabilitasi produktif', unit: 'Ha', baseline: '0 Ha', target: '45 Ha', actual: '39 Ha', achievementPercent: 87, frequency: 'Triwulanan', pic: 'Tim Monev', ragStatus: 'Hijau' },
  { id: 'ind3', code: 'KPI-SO-03', programName: 'Pelatihan Pengelasan Kapal Nelayan', indicatorName: 'Persentase peserta lulus uji sertifikasi BNSP', unit: '%', baseline: '0%', target: '85%', actual: '35%', achievementPercent: 41, frequency: 'Bulanan', pic: 'Bidang Implementasi', ragStatus: 'Kuning' },
  { id: 'ind4', code: 'KPI-PK-04', programName: 'Portofolio Pembiayaan PUMK', indicatorName: 'Rasio kolektibilitas lancar (Non-NPL)', unit: '%', baseline: '91%', target: '95%', actual: '95,2%', achievementPercent: 100, frequency: 'Bulanan', pic: 'Bidang PUMK', ragStatus: 'Hijau' }
];

export const initialMonevIssues: MonevIssue[] = [
  {
    id: 'iss1',
    ticketNo: 'MNE-2026-012',
    programTitle: 'Dermaga Apung Nelayan Sukadamai',
    location: 'Toboali, Bangka Selatan',
    category: 'Deviasi Fisik',
    description: 'Kerusakan tambatan perahu akibat terjangan ombak tinggi saat musim angin barat',
    pic: 'Dedi Kurniawan (Staf Lapangan)',
    deadline: '30 Nov 2026',
    status: 'Dalam Perbaikan',
    slaDaysRemaining: 2,
    geotagCoord: '-2.9812, 106.1245',
    source: 'Monev Lapangan',
    recommendation: 'Penguatan angkur besi galvanis dan penambahan bumper karet dermaga'
  },
  {
    id: 'iss2',
    ticketNo: 'GRV-2026-004',
    programTitle: 'Penerangan Jalan Dusun Air Panas',
    location: 'Namang, Bangka Tengah',
    category: 'Keluhan Warga (Grievance)',
    description: 'Permohonan warga untuk perbaikan panel solar cell yang tertutup reruntuhan ranting',
    pic: 'Hendra Saputra (Tim Implementasi)',
    deadline: '03 Des 2026',
    status: 'Dalam Investigasi',
    slaDaysRemaining: 5,
    geotagCoord: '-2.4109, 106.2198',
    source: 'Grievance Masyarakat',
    recommendation: 'Pembersihan panel dan pelatihan perawatan ringan untuk karang taruna desa'
  }
];

export const initialLessonsLearned: LessonLearned[] = [
  {
    id: 'ls1',
    year: 2026,
    sourceProgram: 'Sentra Nelayan Mandiri Sukadamai',
    pillar: 'Ekonomi',
    oecdDac: { relevance: 92, coherence: 88, effectiveness: 90, efficiency: 85, impact: 94, sustainability: 89 },
    finding: 'Integrasi cold storage langsung dengan koperasi nelayan dan kontrak off-taker mempercepat kenaikan pendapatan 2x lebih efektif dibanding bantuan alat tangkap terpisah.',
    recommendation: 'Replikasi model Sentra Rantai Dingin & Koperasi Pesisir ke wilayah Kundur dan Belitung Timur pada RKAP 2027.',
    appliedToRkap: false
  },
  {
    id: 'ls2',
    year: 2026,
    sourceProgram: 'Pelatihan Pengelasan Kapal Nelayan',
    pillar: 'Sosial',
    oecdDac: { relevance: 86, coherence: 82, effectiveness: 74, efficiency: 78, impact: 80, sustainability: 75 },
    finding: 'Jadwal pelatihan di musim melaut menurunkan tingkat kehadiran peserta hingga 25%.',
    recommendation: 'Jadwalkan program pelatihan vokasi pesisir pada musim angin barat (Nov–Jan) dan sertakan skema magang bengkel mitra.',
    appliedToRkap: true
  }
];

export const initialSbrDatabase: SbrBeneficiary[] = [
  {
    nik: '1901042508820003',
    npwpOrNib: '74.128.445.1-304.000',
    name: 'Baharuddin',
    address: 'Jl. Laut No. 12, Ds. Sukadamai, Toboali, Bangka Selatan',
    ring: 'Ring 1',
    isBlacklisted: false,
    graduationStatus: 'Mandiri',
    programHistory: [
      {
        year: 2024,
        programName: 'Bantuan Alat Tangkap Jaring Monofilament',
        type: 'Program PPM',
        amount: 25000000,
        status: 'Selesai & LPJ Terverifikasi'
      }
    ]
  },
  {
    nik: '1902011403750001',
    npwpOrNib: 'NIB-0220108841299',
    name: 'Siti Aminah',
    address: 'Ds. Selinsing, Kec. Gantung, Belitung Timur',
    ring: 'Ring 1',
    isBlacklisted: false,
    graduationStatus: 'Mandiri',
    programHistory: [
      {
        year: 2025,
        programName: 'Pembiayaan Modal Usaha Kemplang & Getas',
        type: 'Pinjaman PUMK',
        amount: 30000000,
        status: 'Lancar (Angsuran Rutin)'
      }
    ]
  },
  {
    nik: '1901026607810004',
    name: 'Suwardi (Pengurus Musholla)',
    address: 'Pangkal Balam, Pangkalpinang',
    ring: 'Ring 3',
    isBlacklisted: false,
    graduationStatus: 'Selesai LPJ',
    programHistory: [
      {
        year: 2025,
        programName: 'Bantuan Sarana Rumah Ibadah',
        type: 'Charity TJSL',
        amount: 25000000,
        status: 'Selesai LPJ (Terdeteksi dalam periode sama)'
      }
    ]
  }
];

export const initialPartners: PartnerVendor[] = [
  { id: 'v1', code: 'MTR-001', name: 'LPPM Universitas Bangka Belitung', type: 'Perguruan Tinggi', legalityNo: 'SK-KEMENDIKBUD/UBB', dueDiligenceStatus: 'Lulus Verifikasi', performanceScore: 94, activeContracts: 2, isBlacklisted: false },
  { id: 'v2', code: 'MTR-002', name: 'Yayasan Konservasi Pesisir Hijau', type: 'LSM', legalityNo: 'AHU-0021901.AH.01.04', dueDiligenceStatus: 'Lulus Verifikasi', performanceScore: 88, activeContracts: 1, isBlacklisted: false },
  { id: 'v3', code: 'MTR-003', name: 'CV Karya Mandiri Konstruksi', type: 'Vendor', legalityNo: 'NIB-9120301841201', dueDiligenceStatus: 'Ditolak', performanceScore: 45, activeContracts: 0, isBlacklisted: true }
];

export const initialProgramAssets: ProgramAsset[] = [
  { id: 'ast1', assetCode: 'AST-CSR-2026-001', assetName: 'Unit Cold Storage Kapasitas 10 Ton', programTitle: 'Sentra Nelayan Mandiri Sukadamai', recipientCommunity: 'Koperasi Nelayan Sukadamai', bastNo: 'BAST/CSR/2026/014', handoverDate: '12 Sep 2026', value: 850000000, location: 'Toboali, Bangka Selatan', geotagCoord: '-2.9812, 106.1245', condition: 'Baik', maintenanceSchedule: 'Triwulan I 2027' },
  { id: 'ast2', assetCode: 'AST-CSR-2026-002', assetName: 'Rumah Kemasan & Mesin Grinder Lada', programTitle: 'Pemberdayaan Koperasi Tani Lada', recipientCommunity: 'Koperasi Tani Sejahtera', bastNo: 'BAST/CSR/2026/048', handoverDate: '10 Nov 2026', value: 225000000, location: 'Gantung, Belitung Timur', geotagCoord: '-2.9711, 108.1653', condition: 'Baik', maintenanceSchedule: 'Semester I 2027' },
  { id: 'ast3', assetCode: 'AST-CSR-2025-019', assetName: 'Dermaga Apung Nelayan Tradisional', programTitle: 'Infrastruktur Pesisir Sukadamai', recipientCommunity: 'Pokmas Nelayan Pesisir', bastNo: 'BAST/CSR/2025/091', handoverDate: '20 Nov 2025', value: 410000000, location: 'Toboali, Bangka Selatan', geotagCoord: '-2.9812, 106.1245', condition: 'Perlu Perawatan', maintenanceSchedule: 'Segera (Des 2026)' }
];

export const initialRisks: RiskItem[] = [
  { id: 'r1', code: 'RSK-001', programName: 'Bantuan Charity Sarana Umum', category: 'Fraud / COI', description: 'Indikasi pengajuan berulang oleh pemohon sama dan belum melengkapi deklarasi bebas benturan kepentingan', level: 'Tinggi', mitigation: 'Pemblokiran otomatis via SBR deduplikasi & verifikasi lapangan wajib', status: 'Eskalasi' },
  { id: 'r2', code: 'RSK-002', programName: 'Portofolio Pinjaman PUMK Perikanan', category: 'Kredit PUMK', description: 'Penurunan panen tambak udang menyebabkan tunggakan > 90 hari (DPD 94)', level: 'Menengah', mitigation: 'Kunjungan field collection & skema restrukturisasi tenor sesuai kebijakan', status: 'Dipantau' },
  { id: 'r3', code: 'RSK-003', programName: 'Agroforestry Lahan Eks-Tambang', category: 'Lingkungan', description: 'Potensi kekeringan bibit saat musim kemarau panjang di Bangka Tengah', level: 'Rendah', mitigation: 'Pembangunan embung air mini & pemantauan rutin oleh kelompok tani', status: 'Terkendali' }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    timestamp: '27 Nov 2026 12:40 WIB',
    user: 'Ir. Ahmad Zulkarnain',
    role: 'Kepala Divisi CSR',
    module: 'Implementasi PPM',
    action: 'Persetujuan Berjenjang (e-Sign)',
    objectRef: 'SPK/CSR/2026/048',
    ipAddress: '10.20.14.88'
  },
  {
    id: 'log2',
    timestamp: '27 Nov 2026 11:15 WIB',
    user: 'Budi Santoso',
    role: 'Analis Pembiayaan PUMK',
    module: 'Koperasi & PUMK',
    action: 'Simulasi Kelayakan Credit Scoring 5C',
    objectRef: 'PUMK-2025-089',
    ipAddress: '10.20.14.92'
  },
  {
    id: 'log3',
    timestamp: '27 Nov 2026 09:30 WIB',
    user: 'Dra. Ratna Wijaya',
    role: 'Reviewer Proposal',
    module: 'Seleksi Proposal',
    action: 'Scoring Kuantitatif Rubrik Terbobot (Skor 86.5)',
    objectRef: 'PROP-2026-104',
    ipAddress: '10.20.14.65'
  }
];
