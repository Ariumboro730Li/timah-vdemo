import fs from 'node:fs';
import path from 'node:path';

// Deterministic PRNG (Mulberry32) so seed is reproducible and realistic
function createRng(seed = 20261127) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = createRng(20261127);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const regions = [
  { region: 'Bangka Barat', district: 'Kec. Muntok', ring: 'Ring 1', lat: -2.0642, lng: 105.1614, prefix: '190501' },
  { region: 'Bangka Barat', district: 'Kec. Belo Laut', ring: 'Ring 1', lat: -2.0915, lng: 105.1842, prefix: '190501' },
  { region: 'Bangka Barat', district: 'Kec. Tempilang', ring: 'Ring 1', lat: -2.1045, lng: 105.6890, prefix: '190505' },
  { region: 'Bangka Barat', district: 'Kec. Parittiga', ring: 'Ring 1', lat: -1.7142, lng: 105.5124, prefix: '190506' },
  { region: 'Bangka Barat', district: 'Kec. Jebus', ring: 'Ring 1', lat: -1.7510, lng: 105.4892, prefix: '190503' },
  { region: 'Bangka Induk', district: 'Kec. Sungailiat', ring: 'Ring 1', lat: -1.8562, lng: 106.1190, prefix: '190101' },
  { region: 'Bangka Induk', district: 'Kec. Belinyu', ring: 'Ring 1', lat: -1.6428, lng: 105.7812, prefix: '190102' },
  { region: 'Bangka Induk', district: 'Kec. Riau Silip', ring: 'Ring 2', lat: -1.7412, lng: 105.8944, prefix: '190106' },
  { region: 'Bangka Induk', district: 'Kec. Merawang', ring: 'Ring 2', lat: -2.0124, lng: 106.1021, prefix: '190103' },
  { region: 'Bangka Tengah', district: 'Kec. Koba', ring: 'Ring 1', lat: -2.4877, lng: 106.4055, prefix: '190401' },
  { region: 'Bangka Tengah', district: 'Kec. Namang', ring: 'Ring 1', lat: -2.4109, lng: 106.2198, prefix: '190405' },
  { region: 'Bangka Tengah', district: 'Kec. Lubuk Besar', ring: 'Ring 1', lat: -2.6124, lng: 106.7621, prefix: '190406' },
  { region: 'Bangka Tengah', district: 'Kec. Pangkalan Baru', ring: 'Ring 2', lat: -2.1782, lng: 106.1432, prefix: '190402' },
  { region: 'Bangka Selatan', district: 'Kec. Toboali', ring: 'Ring 1', lat: -3.0086, lng: 106.4539, prefix: '190301' },
  { region: 'Bangka Selatan', district: 'Ds. Sukadamai', ring: 'Ring 1', lat: -2.9812, lng: 106.1245, prefix: '190301' },
  { region: 'Bangka Selatan', district: 'Kec. Lepar Pongok', ring: 'Ring 1', lat: -2.9610, lng: 106.7912, prefix: '190302' },
  { region: 'Bangka Selatan', district: 'Kec. Tukak Sadai', ring: 'Ring 2', lat: -3.0211, lng: 106.6451, prefix: '190307' },
  { region: 'Belitung', district: 'Kec. Tanjungpandan', ring: 'Ring 2', lat: -2.7418, lng: 107.6380, prefix: '190201' },
  { region: 'Belitung', district: 'Kec. Sijuk', ring: 'Ring 2', lat: -2.5912, lng: 107.7215, prefix: '190204' },
  { region: 'Belitung Timur', district: 'Kec. Gantung', ring: 'Ring 1', lat: -2.9711, lng: 108.1653, prefix: '190602' },
  { region: 'Belitung Timur', district: 'Kec. Manggar', ring: 'Ring 1', lat: -2.8825, lng: 108.2736, prefix: '190601' },
  { region: 'Belitung Timur', district: 'Kec. Damar', ring: 'Ring 1', lat: -2.7912, lng: 108.2104, prefix: '190605' },
  { region: 'Kepulauan Riau', district: 'Pulau Kundur Barat', ring: 'Ring 1', lat: 0.7351, lng: 103.4285, prefix: '210202' },
  { region: 'Kepulauan Riau', district: 'Pulau Kundur Utara', ring: 'Ring 1', lat: 0.8124, lng: 103.4512, prefix: '210206' },
  { region: 'Pangkalpinang', district: 'Kec. Pangkal Balam', ring: 'Ring 3', lat: -2.1180, lng: 106.1355, prefix: '197103' }
];

function jitterCoord(reg) {
  const lat = (reg.lat + (rand() - 0.5) * 0.04).toFixed(4);
  const lng = (reg.lng + (rand() - 0.5) * 0.04).toFixed(4);
  return `${lat}, ${lng}`;
}

function makeNik(prefix, index) {
  const day = String(randInt(1, 28)).padStart(2, '0');
  const month = String(randInt(1, 12)).padStart(2, '0');
  const year = String(randInt(68, 97)).padStart(2, '0');
  const seq = String((index % 8999) + 1000).padStart(4, '0');
  return `${prefix}${day}${month}${year}${seq}`;
}

const firstNames = [
  'Baharuddin', 'Siti Aminah', 'Hendra', 'Rizal Efendi', 'Nurhayati', 'Dedi Kurniawan', 'M. Iskandar', 'Kartini',
  'Suwardi', 'Samsul', 'Yuliana', 'Agus Salim', 'Fitriani', 'Ruslan', 'Dewi Sartika', 'Herman',
  'Mardiana', 'Zulkifli', 'Rahmawati', 'Suharto', 'Lestari', 'Fauzi', 'Ningsih', 'Bambang',
  'Suryani', 'Rudi Hartono', 'Wahyuni', 'Arifin', 'Hasanah', 'Darwis', 'Sri Wahyuni', 'Taufik',
  'Mulyadi', 'Rosmala', 'Syahrul', 'Endang', 'Kurnia', 'Junaidi', 'Halimah', 'Sofyan'
];

const lastNames = [
  'Putra', 'Wijaya', 'Santoso', 'Saputra', 'Pratama', 'Hidayat', 'Nugroho', 'Rahman',
  'Hakim', 'Anwar', 'Siregar', 'Kusuma', 'Setiawan', 'Maulana', 'Ramadhan', 'Firdaus',
  'Gunawan', 'Wibowo', 'Utama', 'Purnama', 'Laksana', 'Kurnia', 'Bakri', 'Nasution'
];

const fullName = () => `${pick(firstNames)} ${pick(lastNames)}`;

const groupPrefixes = [
  'Kelompok Nelayan', 'Kelompok Tani', 'Kelompok Wanita Tani', 'Koperasi Pesisir', 'Pokdakan',
  'Pokdarwis', 'Yayasan Pendidikan', 'Karang Taruna', 'BUMDes', 'KUBE Pengolahan',
  'Perkumpulan Perajin', 'Posyandu', 'Panitia Sarana Warga', 'Komunitas Konservasi'
];

const groupSuffixes = [
  'Harapan Jaya', 'Maju Bersama', 'Sejahtera Mandiri', 'Bahari Lestari', 'Pesisir Makmur',
  'Bina Karya', 'Sinar Laut', 'Berkah Tani', 'Pelawan Hijau', 'Karya Muda',
  'Cahaya Pesisir', 'Tunas Bangsa', 'Mutiara Laut', 'Surya Mandiri', 'Lestari Alam'
];

const umkTypes = [
  'Kuliner Olahan Ikan', 'Kemplang & Getas Bangka', 'Agribisnis Lada Putih', 'Madu Pelawan & Kelulut',
  'Kerajinan Pewter Timah', 'Tenun Cual & Batik', 'Jasa Bengkel & Las Kapal', 'Perikanan Budidaya',
  'Pengolahan Hasil Laut', 'Konveksi & Jahit Lokal', 'Warung Sembako & Kelontong', 'Pertanian Hortikultura'
];

const umkNamePrefixes = [
  'UMK', 'Usaha', 'Sentra', 'Dapur', 'Kriya', 'Bengkel', 'Tambak', 'Kedai', 'Galeri', 'Tani'
];

const pillars = ['Ekonomi', 'Lingkungan', 'Sosial', 'Hukum & Tata Kelola'];
const sdgByPillar = {
  Ekonomi: [['SDG 8', 'SDG 14'], ['SDG 8', 'SDG 12'], ['SDG 1', 'SDG 8'], ['SDG 8', 'SDG 9']],
  Lingkungan: [['SDG 13', 'SDG 15'], ['SDG 14', 'SDG 13'], ['SDG 15', 'SDG 6'], ['SDG 12', 'SDG 13']],
  Sosial: [['SDG 4', 'SDG 8'], ['SDG 3', 'SDG 6'], ['SDG 1', 'SDG 2'], ['SDG 4', 'SDG 5']],
  'Hukum & Tata Kelola': [['SDG 16', 'SDG 17'], ['SDG 17', 'SDG 11']]
};

const programTopicsByPillar = {
  Ekonomi: [
    'Sentra Hilirisasi Nelayan & Cold Storage',
    'Pemberdayaan Koperasi Tani Lada Putih & Nanas',
    'Penguatan Rumah Produksi Pakan Ikan Mandiri',
    'Pendampingan Kemasan & Sertifikasi Halal UMKM',
    'Modernisasi Perahu & Alat Tangkap Ramah Lingkungan',
    'Inkubasi Bisnis Pemuda Pesisir & E-Katalog',
    'Penguatan BUMDes Logistik Perikanan Rakyat',
    'Sentra Pengolahan Rumput Laut & Abon Ikan'
  ],
  Lingkungan: [
    'Agroforestry & Pemulihan Lahan Bekas Tambang Timah',
    'Rehabilitasi Mangrove & Sabuk Hijau Pesisir',
    'Konservasi Terumbu Karang & Transplantasi Biota Laut',
    'Bank Sampah Terpadu & Ekonomi Sirkular Desa',
    'Reklamasi Hijau Hutan Pelawan & Budidaya Kelulut',
    'Pengelolaan Limbah Organik & Kompos Terpadu'
  ],
  Sosial: [
    'Beasiswa Generasi Cemerlang Vokasi Tambang & Bahari',
    'Pembangunan Sarana Air Bersih RO Tenaga Surya',
    'Penguatan Layanan Puskesmas Keliling & Posyandu Stunting',
    'Pelatihan Sertifikasi Pengelasan Kapal & K3 BNSP',
    'Revitalisasi Sarana Belajar Sekolah Pesisir',
    'Penerangan Jalan Tenaga Surya Dusun Terpencil'
  ],
  'Hukum & Tata Kelola': [
    'Penguatan Tata Kelola Koperasi & Kepatuhan RAT Digital',
    'Sosialisasi Anti-Gratifikasi & Kemitraan Transparan Desa',
    'Pendampingan Legalitas NIB, AHU & Sertifikasi Usaha Mikro'
  ]
};

const partnerOrgs = [
  'LPPM Universitas Bangka Belitung',
  'Politeknik Manufaktur Negeri Babel',
  'Yayasan Konservasi Pesisir Hijau',
  'Dinas Kelautan & Perikanan Daerah',
  'Dinas Koperasi & UMKM Daerah',
  'Balai Latihan Kerja (BLK) Provinsi',
  'Yayasan Bina Tani Nusantara',
  'KPH Sungai Sembulan & Mitra Hijau',
  'BPBD Kabupaten Wilayah Operasi',
  'Dekranasda Provinsi Kep. Babel'
];

// 1. Social Mapping (25 rows)
const priorityNeedsPool = [
  'Cold storage nelayan, diversifikasi olahan hasil laut, air bersih',
  'Dermaga nelayan tradisional, permodalan PUMK, alat tangkap ramah lingkungan',
  'Reklamasi agroforestry pasca tambang, budidaya madu kelulut & pelawan',
  'Penguatan koperasi lada putih & nanas, digitalisasi pembukuan koperasi',
  'Rehabilitasi mangrove, sarana air bersih dusun pesisir, beasiswa vokasi',
  'Pelatihan sertifikasi K3 & las pemuda, posyandu penurunan stunting',
  'Akses pasar e-katalog UMKM, sertifikasi halal & PIRT produk kuliner'
];

const socialMapping = regions.map((r, i) => ({
  id: `sm-${i + 1}`,
  region: r.region,
  district: r.district,
  ring: r.ring,
  population: randInt(18500, 74000),
  povertyRate: Number((4.8 + rand() * 3.4).toFixed(1)),
  umkCount: randInt(190, 720),
  priorityNeeds: priorityNeedsPool[i % priorityNeedsPool.length],
  stakeholderPosition:
    r.ring === 'Ring 1'
      ? 'Tinggi-Tinggi (Kelola Erat)'
      : r.ring === 'Ring 2'
      ? 'Tinggi-Rendah (Jaga Kepuasan)'
      : 'Rendah-Tinggi (Informasikan)',
  productionContext:
    r.ring === 'Ring 1'
      ? 'Area operasi tambang aktif / unit metalurgi'
      : r.ring === 'Ring 2'
      ? 'Wilayah penyangga operasional & reklamasi'
      : 'Wilayah administrasi & dukungan korporat',
  dataSource: pick(['BPS / Podes', 'DTSEN', 'Survei Lapangan']),
  geotagCoord: `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`
}));

// 2. Default Scoring Rubric & Approval Matrix (KAK 8.1 & Lampiran B)
const scoringRubric = [
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

const approvalMatrix = [
  { id: 'am1', label: '≤ Rp 20 Juta', maxAmount: 20000000, reviewer: 'Staf / Kepala Bidang', approver: 'Kepala Bidang' },
  { id: 'am2', label: '> Rp 20 Juta s.d. Rp 100 Juta', maxAmount: 100000000, reviewer: 'Kepala Bidang', approver: 'Kepala Divisi' },
  { id: 'am3', label: '> Rp 100 Juta', maxAmount: null, reviewer: 'Kepala Divisi', approver: 'Direksi / Komite' }
];

// 3. SBR Database (160 unique beneficiaries — includes known test NIKs at top!)
const sbrDatabase = [
  {
    nik: '1901042508820003',
    npwpOrNib: '74.128.445.1-304.000',
    name: 'Baharuddin',
    address: 'Jl. Laut No. 12, Ds. Sukadamai, Toboali, Bangka Selatan',
    ring: 'Ring 1',
    isBlacklisted: false,
    graduationStatus: 'Mandiri',
    programHistory: [
      { year: 2024, programName: 'Bantuan Alat Tangkap Jaring Monofilament', type: 'Program PPM', amount: 25000000, status: 'Selesai & LPJ Terverifikasi' }
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
      { year: 2025, programName: 'Pembiayaan Modal Usaha Kemplang & Getas', type: 'Pinjaman PUMK', amount: 30000000, status: 'Lancar (Angsuran Rutin)' }
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
      { year: 2025, programName: 'Bantuan Sarana Rumah Ibadah', type: 'Charity TJSL', amount: 25000000, status: 'Selesai LPJ (Terdeteksi dalam periode sama)' }
    ]
  }
];

const sbrGraduations = ['Pemula', 'Berkembang', 'Mandiri', 'Selesai LPJ'];
for (let i = 4; i <= 160; i++) {
  const reg = regions[i % regions.length];
  const nik = makeNik(reg.prefix, i);
  const year = pick([2023, 2024, 2025, 2026]);
  const type = pick(['Program PPM', 'Pinjaman PUMK', 'Charity TJSL', 'Program Flagship']);
  const isBlacklisted = i % 38 === 0;
  sbrDatabase.push({
    nik,
    npwpOrNib: i % 2 === 0 ? `NIB-022010${randInt(1000000, 9999999)}` : undefined,
    name: fullName(),
    address: `${reg.district}, ${reg.region}`,
    ring: reg.ring,
    isBlacklisted,
    blacklistReason: isBlacklisted ? 'Ketidaksesuaian penggunaan dana pada audit lapangan tahun lalu' : undefined,
    graduationStatus: pick(sbrGraduations),
    programHistory: [
      {
        year,
        programName: `${pick(['Bantuan', 'Pemberdayaan', 'Pembiayaan', 'Pendampingan'])} ${pick(umkTypes)}`,
        type,
        amount: randInt(10, 85) * 1000000,
        status: year <= 2025 ? 'Selesai & LPJ Terverifikasi' : 'Aktif Berjalan'
      }
    ]
  });
}

// 4. RKAP List (45 programs)
const rkapList = [];
for (let i = 1; i <= 45; i++) {
  const pillar = pillars[(i - 1) % pillars.length];
  const reg = regions[(i - 1) % regions.length];
  const topic = pick(programTopicsByPillar[pillar]);
  const budget = randInt(35, 260) * 10000000; // 350 Jt - 2.6 M
  const status =
    i <= 28 ? 'Disetujui Direksi' : i <= 35 ? 'Review Kadiv' : i <= 41 ? 'Review Kabid' : 'Draft';
  const convertedToImpl = status === 'Disetujui Direksi' && i <= 20;
  const committedBudget = status === 'Disetujui Direksi' ? Math.round(budget * (0.7 + rand() * 0.25)) : 0;
  const realizedBudget = convertedToImpl ? Math.round(committedBudget * (0.45 + rand() * 0.5)) : 0;
  const partner = pick(partnerOrgs);

  rkapList.push({
    id: `rka-${i}`,
    code: `RKA-2026-${String(i).padStart(3, '0')}`,
    title: `${topic} — ${reg.district}`,
    pillar,
    sdgs: pick(sdgByPillar[pillar]),
    location: `${reg.district}, ${reg.region}`,
    ring: reg.ring,
    budget,
    committedBudget,
    realizedBudget,
    priorityScore: randInt(74, 95),
    status,
    version: status === 'Disetujui Direksi' ? 'v2.0 (Final)' : 'v1.1',
    kpiTarget: `${randInt(30, 180)} penerima manfaat langsung, kenaikan kapasitas ≥ ${randInt(25, 45)}%`,
    baseline: `Hasil Social Mapping ${reg.district} (${reg.ring})`,
    synergyPartner: partner,
    convertedToImpl,
    theoryOfChange: {
      input: `Anggaran Rp ${(budget / 1000000).toLocaleString('id-ID')} Jt & pendampingan ${partner}`,
      activity: `Implementasi ${topic} serta pembinaan kelompok sasaran`,
      output: `Fasilitas terbangun & ${randInt(30, 150)} peserta terlatih`,
      outcome: `Peningkatan kemandirian ekonomi / lingkungan ≥ ${randInt(25, 45)}% dalam 12 bulan`,
      impact: `Kemandirian masyarakat berkelanjutan di ${reg.region} (${reg.ring})`,
      riskSafeguard: 'Pemantauan risiko sosial, lingkungan, dan bebas benturan kepentingan (ISO 37001)'
    }
  });
}

// 5. Proposals List (110 proposals)
const proposalChannels = ['Portal Web/Mobile', 'Aplikasi TEO', 'Surat OCR', 'Fast-Track Darurat'];
const proposalCategories = [
  'Pemberdayaan Pertanian', 'Pengadaan Alat Tangkap Ramah Lingkungan', 'Pendidikan',
  'Kesehatan', 'Keagamaan', 'Sarana Umum', 'Bencana', 'Pelatihan Vokasi Pemuda', 'Pengolahan Hasil Laut'
];
const reviewersPool = ['Dra. Ratna Wijaya', 'Hendra Saputra', 'Rini Kusumawati', 'Budi Santoso', 'Dedi Kurniawan'];
const proposals = [
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
      { reviewerName: 'Sistem Otomatis (Knock-out)', date: '21 Nov 2026', totalScore: 52.0, notes: 'Terdeteksi duplikasi NIK penerima pada tahun anggaran 2025' }
    ],
    score: 52.0,
    recommendation: 'Ditolak',
    committeeDecision: 'Ditolak',
    approvalStatus: 'Ditolak',
    dateSubmitted: '20 Nov 2026',
    geotagCoord: '-2.1316, 106.1169'
  }
];

for (let i = 5; i <= 110; i++) {
  const reg = regions[i % regions.length];
  const isDup = i % 14 === 0;
  const isUnscored = !isDup && i % 5 === 0;
  const programType = i % 3 === 0 ? 'Bantuan Charity' : i % 11 === 0 ? 'Program Flagship' : 'Program PPM';
  const requestedAmount =
    programType === 'Bantuan Charity'
      ? randInt(8, 65) * 1000000
      : programType === 'Program Flagship'
      ? randInt(150, 450) * 1000000
      : randInt(25, 160) * 1000000;
  const score = isDup ? randInt(40, 58) : isUnscored ? undefined : Number((62 + rand() * 33).toFixed(1));
  const recommendation = isDup
    ? 'Ditolak'
    : score === undefined
    ? 'Menunggu Review'
    : score >= 80
    ? 'Prioritas Disetujui'
    : score >= 65
    ? 'Layak Bersyarat'
    : 'Ditolak';
  const committeeDecision =
    recommendation === 'Ditolak'
      ? 'Ditolak'
      : recommendation === 'Prioritas Disetujui' && i % 2 === 0
      ? 'Disetujui Komite'
      : 'Belum Rapat';
  const approvalStatus =
    committeeDecision === 'Ditolak'
      ? 'Ditolak'
      : committeeDecision === 'Disetujui Komite' && i % 4 === 0
      ? 'Disetujui'
      : 'Menunggu';

  proposals.push({
    id: `p-${i}`,
    ticketNo: `PROP-2026-${String(i + 105).padStart(3, '0')}`,
    applicant: `${pick(groupPrefixes)} ${pick(groupSuffixes)} (${reg.district})`,
    nik: isDup ? '1901026607810004' : makeNik(reg.prefix, 300 + i),
    legalityNo: i % 2 === 0 ? `AHU-00${randInt(10000, 99999)}.AH.01` : `SK-KADES/${String(i).padStart(3, '0')}/2026`,
    channel: pick(proposalChannels),
    programType,
    category: pick(proposalCategories),
    requestedAmount,
    rabAnomalyFlag: i % 9 === 0 ? `Unit cost ${randInt(14, 28)}% di atas standar katalog` : undefined,
    location: `${reg.district}, ${reg.region}`,
    ring: reg.ring,
    sbrStatus: isDup ? 'Duplikasi Terdeteksi' : i % 4 === 0 ? 'Terverifikasi' : 'Unik (Bersih)',
    nlpSimilarityPercent: isDup ? randInt(76, 92) : randInt(6, 32),
    adminScreeningStatus: isDup ? 'Gugur' : 'Lolos',
    reviewerScores:
      score === undefined
        ? []
        : [
            {
              reviewerName: pick(reviewersPool),
              date: `${randInt(1, 26)} Nov 2026`,
              totalScore: score,
              notes: isDup ? 'Gugur otomatis oleh validasi SBR' : 'Penilaian rubrik terbobot lengkap'
            }
          ],
    score,
    recommendation,
    committeeDecision,
    approvalStatus,
    convertedToImpl: approvalStatus === 'Disetujui' && i % 8 === 0,
    dateSubmitted: `${String(randInt(1, 27)).padStart(2, '0')} ${pick(['Okt', 'Nov'])} 2026`,
    geotagCoord: jitterCoord(reg)
  });
}

// 6. Implementation Projects (60 projects)
const projects = [];
for (let i = 1; i <= 60; i++) {
  const reg = regions[(i - 1) % regions.length];
  const pillar = pillars[(i - 1) % 3];
  const topic = pick(programTopicsByPillar[pillar]);
  const contractValue = randInt(80, 480) * 1000000;
  const progressPercent = i % 5 === 0 ? 100 : randInt(25, 92);
  const realizedValue = Math.round((contractValue * progressPercent) / 100);
  const ragStatus = progressPercent === 100 ? 'Hijau' : i % 9 === 0 ? 'Merah' : i % 4 === 0 ? 'Kuning' : 'Hijau';
  const bastSigned = progressPercent === 100 && i % 10 === 0;

  projects.push({
    id: `prj-${i}`,
    spkNo: `SPK/CSR/2026/${String(i).padStart(3, '0')}`,
    sourceRkapCode: `RKA-2026-${String(((i - 1) % 28) + 1).padStart(3, '0')}`,
    title: `${topic} — ${reg.district}`,
    partner: pick(partnerOrgs),
    pillar,
    location: `${reg.district}, ${reg.region}`,
    geotagCoord: jitterCoord(reg),
    contractValue,
    realizedValue,
    currentTerm:
      progressPercent === 100
        ? 'Pencairan Penuh (100%)'
        : progressPercent >= 60
        ? `Termin 2 (${progressPercent}%)`
        : `Termin 1 (${progressPercent}%)`,
    sapPoNo: `450089${String(100 + i)}`,
    sapStatus: progressPercent === 100 ? 'Settled' : i % 6 === 0 ? 'Pending Approval' : 'Posted',
    geotagPhotos: randInt(4, 28),
    qrAttendanceCount: randInt(18, 120),
    progressPercent,
    ragStatus,
    changeRequests: i % 7 === 0 ? 1 : 0,
    lpjStatus: bastSigned ? 'Terverifikasi' : progressPercent >= 70 ? 'Review' : 'Belum',
    bastSigned,
    exitStrategy: `Pengelolaan mandiri oleh kelompok masyarakat / koperasi lokal ${reg.district}`,
    milestones: [
      { id: 'm1', name: 'Assessment Baseline & Mobilisasi Mitra', targetDate: '15 Agu 2026', weightPercent: 25, status: 'Selesai' },
      { id: 'm2', name: 'Pelaksanaan Kegiatan Utama & Pembinaan', targetDate: '30 Okt 2026', weightPercent: 45, status: progressPercent >= 65 ? 'Selesai' : 'Berjalan' },
      { id: 'm3', name: 'Verifikasi Output, LPJ & Serah Terima BAST', targetDate: '15 Des 2026', weightPercent: 30, status: progressPercent === 100 ? 'Selesai' : ragStatus === 'Kuning' ? 'Tertunda' : 'Berjalan' }
    ]
  });
}

// 7. Charities (75 rows)
const charityCategories = ['Bencana', 'Keagamaan', 'Pendidikan', 'Kesehatan', 'Sarana Umum'];
const banks = ['Mandiri', 'BRI', 'BNI', 'BSI', 'Bank Sumsel Babel'];
const charities = [];
for (let i = 1; i <= 75; i++) {
  const reg = regions[i % regions.length];
  const category = charityCategories[i % charityCategories.length];
  const isFastTrack = category === 'Bencana' && i % 2 === 0;
  const requestedAmount = isFastTrack ? randInt(25, 95) * 1000000 : randInt(5, 45) * 1000000;
  const hasFraud = i % 15 === 0;
  const status = hasFraud
    ? 'Verifikasi'
    : pick(['BAST Selesai', 'BAST Selesai', 'Cair ke Penerima', 'Menunggu Persetujuan', 'Verifikasi']);
  const approverLevel =
    requestedAmount <= 20000000 ? 'Kabid' : requestedAmount <= 100000000 ? 'Kepala Divisi' : 'Direksi / Komite';

  charities.push({
    id: `ch-${i}`,
    ticketNo: `CHR-2026-${String(i).padStart(3, '0')}`,
    applicant: `${pick(['BPBD', 'Panitia', 'Yayasan', 'Posyandu', 'Pengurus Masjid', 'Komite Sekolah', 'Pengurus Desa'])} ${pick(groupSuffixes)} ${reg.district}`,
    nik: hasFraud ? '1901026607810004' : makeNik(reg.prefix, 500 + i),
    accountNo: `${randInt(100, 999)}-${randInt(10, 99)}-${randInt(1000000, 9999999)} (${pick(banks)})`,
    category,
    isFastTrack,
    requestedAmount,
    location: `${reg.district}, ${reg.region}`,
    geotagCoord: jitterCoord(reg),
    conflictOfInterestDeclared: !hasFraud,
    fraudFlags: hasFraud ? ['Pemohon berulang terdeteksi di SBR', 'Deklarasi COI belum ditandatangani'] : [],
    approverLevel,
    disbursementStatus: status,
    bastNo: status === 'BAST Selesai' ? `BAST/CHR/2026/${String(i).padStart(3, '0')}` : undefined,
    dateSubmitted: `${String(randInt(1, 27)).padStart(2, '0')} ${pick(['Sep', 'Okt', 'Nov'])} 2026`
  });
}

// 8. Flagship Programs (12 multi-year programs)
const flagshipTemplates = [
  ['Sentra Nelayan Mandiri Sukadamai', 'Ekonomi & Pesisir', 'Toboali, Bangka Selatan'],
  ['Reklamasi Hijau Madu Pelawan & Kelulut', 'Lingkungan & Ekonomi', 'Namang, Bangka Tengah'],
  ['Sentra Kerajinan Pewter Timah Heritage', 'Ekonomi Kreatif', 'Muntok, Bangka Barat'],
  ['Desa Wisata Bahari & Terumbu Karang Belinyu', 'Lingkungan & Wisata', 'Belinyu, Bangka Induk'],
  ['Koridor Lada Putih Organik & Kemasan Ekspor', 'Agribisnis', 'Gantung, Belitung Timur'],
  ['Kampung Mangrove & Kepiting Bakau Kundur', 'Ekonomi Sirkular', 'Pulau Kundur, Kep. Riau'],
  ['Sekolah Vokasi Maritim & Pengelasan Babel', 'Pendidikan Vokasi', 'Sungailiat, Bangka Induk'],
  ['Sentra Olahan Ikan & Cold Storage Parittiga', 'Ekonomi & Pesisir', 'Parittiga, Bangka Barat'],
  ['Agroforestry Nanas & Lebah Trigona Koba', 'Lingkungan & Ekonomi', 'Koba, Bangka Tengah'],
  ['Rumah Tenun Cual & Wastra Perempuan Belitung', 'Inklusivitas & Kriya', 'Tanjungpandan, Belitung'],
  ['Klaster Air Bersih RO Tenaga Surya Lepar Pongok', 'Sosial & Kesehatan', 'Lepar Pongok, Bangka Selatan'],
  ['Pusat Inovasi Koperasi Digital Manggar', 'Kelembagaan Ekonomi', 'Manggar, Belitung Timur']
];

const flagships = flagshipTemplates.map(([name, pillar, location], idx) => {
  const reg = regions[(idx * 2) % regions.length];
  const investmentCost = randInt(65, 220) * 10000000;
  const sroiRatio = Number((2.85 + rand() * 1.45).toFixed(2));
  const socialBenefitValue = Math.round(investmentCost * sroiRatio);
  const output = randInt(78, 96);
  const outcome = randInt(76, 94);
  const efficiency = randInt(74, 92);
  const governance = randInt(80, 95);
  const satisfaction = randInt(80, 96);
  const totalPerf = output * 0.25 + outcome * 0.35 + efficiency * 0.15 + governance * 0.15 + satisfaction * 0.1;

  return {
    id: `flg-${idx + 1}`,
    code: `FLG-2025-${String(idx + 1).padStart(2, '0')}`,
    name,
    pillar,
    location,
    geotagCoord: `${reg.lat.toFixed(4)}, ${reg.lng.toFixed(4)}`,
    period: idx % 2 === 0 ? '2025 – 2027 (Multi-Tahun)' : '2024 – 2026 (Multi-Tahun)',
    theoryOfChange: `Intervensi sarana produktif & pendampingan intensif -> Produktivitas & nilai tambah meningkat -> Kemandirian ekonomi & lingkungan berkelanjutan di ${location}`,
    baselineSummary: `Kapasitas awal kelompok skala mikro; akses pasar dan fasilitas teknologi terbatas`,
    kpiTargetSummary: `Pendapatan naik ≥ 35%; serapan tenaga kerja lokal; SROI ≥ 3,0`,
    investmentCost,
    socialBenefitValue,
    sroiRatio,
    jobsCreated: randInt(35, 165),
    beneficiaries: randInt(90, 420),
    performanceScores: { output, outcome, efficiency, governance, satisfaction },
    ragStatus: totalPerf >= 75 ? 'Hijau' : 'Kuning',
    graduationTier: pick(['Berkembang', 'Mandiri', 'Naik Kelas', 'Pemula']),
    collaborators: [pick(partnerOrgs), `Pemda ${reg.region}`, `Koperasi Lokal ${reg.district}`],
    successStory: `Kelompok binaan ${name} mencatat peningkatan omzet rata-rata ${randInt(32, 58)}% dan berhasil membangun rantai pasok mandiri di wilayah ${reg.region}.`
  };
});

// 9. PUMK Onboarding Applications (35 rows)
const pumkApplications = [];
for (let i = 1; i <= 35; i++) {
  const reg = regions[i % regions.length];
  const ch = randInt(68, 94);
  const ca = randInt(66, 92);
  const cp = randInt(64, 90);
  const cn = randInt(70, 92);
  const cl = randInt(65, 90);
  const creditScore = Number((ch * 0.25 + ca * 0.25 + cp * 0.2 + cn * 0.15 + cl * 0.15).toFixed(1));
  const requestedPlafon = randInt(15, 100) * 1000000;
  const recommendedPlafon = creditScore >= 80 ? requestedPlafon : Math.round(requestedPlafon * 0.8);
  const status = pick(['Onboarding', 'Survei Lapangan', 'Komite Pendanaan', 'Komite Pendanaan', 'Disetujui & Cair']);

  pumkApplications.push({
    id: `app-${i}`,
    regNo: `REG-PUMK-2026-${String(i).padStart(3, '0')}`,
    applicantName: fullName(),
    businessName: `${pick(umkNamePrefixes)} ${pick(umkTypes)} ${pick(groupSuffixes)}`,
    nik: makeNik(reg.prefix, 700 + i),
    nibOrAhu: `NIB-022010${randInt(1000000, 9999999)}`,
    businessType: pick(umkTypes),
    location: `${reg.district}, ${reg.region}`,
    geotagCoord: jitterCoord(reg),
    requestedPlafon,
    tenorMonths: pick([12, 24, 36]),
    fiveC: { character: ch, capacity: ca, capital: cp, condition: cn, collateral: cl },
    creditScore,
    recommendedPlafon,
    fieldSurveyDone: status !== 'Onboarding',
    status
  });
}

// 10. PUMK Active Loans (120 rows — realistic NPL ~2.6%)
const pumkLoans = [
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

for (let i = 5; i <= 120; i++) {
  const reg = regions[i % regions.length];
  const ceiling = randInt(15, 100) * 1000000;
  const tenorMonths = pick([24, 36]);
  const paidInstallments = randInt(2, tenorMonths - 2);
  const remainingPrincipal = Math.max(2000000, Math.round(ceiling * (1 - paidInstallments / tenorMonths)));
  const monthlyInstallment = Math.round((ceiling * 1.03) / tenorMonths);

  // Keep NPL realistic (~3% >90d, ~9% watchlist)
  let dpd = 0;
  let collectibility = 'Lancar';
  if (i % 34 === 0) {
    dpd = randInt(95, 155);
    collectibility = dpd > 120 ? 'Diragukan' : 'Kurang Lancar';
  } else if (i % 12 === 0) {
    dpd = randInt(7, 29);
    collectibility = 'Pemantauan';
  }

  pumkLoans.push({
    id: `pumk-${i}`,
    contractNo: `PUMK-${pick([2024, 2025, 2026])}-${String(i + 120).padStart(3, '0')}`,
    vaNumber: `887910${String(240000 + i)}`,
    borrowerName: `${pick(umkNamePrefixes)} ${pick(umkTypes)} ${pick(firstNames)}`,
    nik: makeNik(reg.prefix, 900 + i),
    businessType: pick(umkTypes),
    location: `${reg.district}, ${reg.region}`,
    geotagCoord: jitterCoord(reg),
    ceiling,
    remainingPrincipal,
    monthlyInstallment,
    tenorMonths,
    paidInstallments,
    dpd,
    collectibility,
    creditScore: dpd === 0 ? randInt(78, 95) : randInt(52, 72),
    lastPaymentDate: dpd === 0 ? `${String(randInt(1, 26)).padStart(2, '0')} Nov 2026` : `${String(randInt(1, 28)).padStart(2, '0')} Sep 2026`,
    graduationStatus: dpd === 0 ? pick(['Berkembang', 'Mandiri', 'Bankable / KUR']) : 'Pemula',
    collectionAssigned: dpd > 30
  });
}

// 11. Cooperatives (24 rows)
const cooperatives = [];
for (let i = 1; i <= 24; i++) {
  const reg = regions[i % regions.length];
  const healthScore = randInt(58, 94);
  const healthCategory = healthScore >= 80 ? 'Sehat' : healthScore >= 68 ? 'Cukup Sehat' : 'Dalam Pengawasan';
  cooperatives.push({
    id: `kop-${i}`,
    code: `KOP-2026-${String(i).padStart(2, '0')}`,
    name: `Koperasi ${pick(['Nelayan', 'Tani Lada', 'Serba Usaha', 'Produsen UMKM', 'Pesisir'])} ${pick(groupSuffixes)}`,
    ahuNo: `AHU-000${randInt(1000, 9999)}.AH.01.26`,
    location: `${reg.district}, ${reg.region}`,
    memberCount: randInt(45, 240),
    capital: randInt(120, 680) * 1000000,
    ratCompliant: healthScore >= 66,
    shuLastYear: randInt(15, 130) * 1000000,
    healthScore,
    healthCategory,
    digitalBookkeeping: healthScore >= 72,
    strengtheningPlan:
      healthCategory === 'Sehat'
        ? 'Ekspansi akses pasar ekspor & kemitraan perbankan komersial'
        : healthCategory === 'Cukup Sehat'
        ? 'Digitalisasi pembukuan anggota & peningkatan tata kelola RAT'
        : 'Pendampingan intensif pengurus & audit pembukuan internal'
  });
}

// 12. UMK E-Katalog (30 rows)
const catalogProducts = [
  ['Kemplang & Otak-Otak Ikan Tenggiri Vakum', 'Kuliner', 'Rp 35.000 - Rp 85.000', 'Halal MUI & PIRT'],
  ['Madu Pahit Pelawan & Kelulut Organik 500ml', 'Agribisnis', 'Rp 150.000 - Rp 280.000', 'BPOM & Halal'],
  ['Plakat & Miniatur Kapal Keruk Pewter Timah', 'Kriya', 'Rp 250.000 - Rp 1.800.000', 'SNI Kerajinan'],
  ['Lada Putih Muntok Premium Kemasan 250g', 'Agribisnis', 'Rp 65.000 - Rp 120.000', 'Indikasi Geografis & BPOM'],
  ['Kain Tenun Cual Motif Pesisir Bangka', 'Wastra', 'Rp 450.000 - Rp 2.500.000', 'HAKI Motif Daerah'],
  ['Selai Nanas & Keripik Nanas Belitung Timur', 'Kuliner', 'Rp 25.000 - Rp 60.000', 'Halal MUI & PIRT'],
  ['Abon Ikan Tongkol & Terasi Udang Toboali', 'Kuliner', 'Rp 30.000 - Rp 75.000', 'PIRT & Halal'],
  ['Anyaman Keranjang Daun Nipah & Purun', 'Kriya', 'Rp 45.000 - Rp 180.000', 'Kurasi Dekranasda']
];
const offTakers = ['Galeri Bandara Depati Amir', 'Retail Modern & Hotel Nasional', 'Suvenir Protokoler BUMN', 'Marketplace PaDi UMKM', 'Eksportir Rempah Nasional'];

const umkCatalog = [];
for (let i = 1; i <= 30; i++) {
  const reg = regions[i % regions.length];
  const [productName, category, priceRange, certification] = catalogProducts[i % catalogProducts.length];
  umkCatalog.push({
    id: `cat-${i}`,
    businessName: `${pick(umkNamePrefixes)} ${pick(groupSuffixes)} (${reg.district})`,
    productName,
    category,
    priceRange,
    location: `${reg.district}, ${reg.region}`,
    certification,
    offTakerMatch: pick(offTakers)
  });
}

// 13. Monev Indicators (32 rows)
const indicatorTemplates = [
  ['Kenaikan pendapatan rata-rata penerima manfaat', '%', '0%', '35%'],
  ['Jumlah lapangan kerja lokal baru tercipta', 'Orang', '0', '50'],
  ['Luas lahan reklamasi pasca tambang produktif', 'Ha', '0 Ha', '45 Ha'],
  ['Persentase peserta pelatihan lulus sertifikasi BNSP', '%', '0%', '85%'],
  ['Rasio kolektibilitas lancar portofolio PUMK', '%', '91%', '95%'],
  ['Skor kapasitas kelembagaan kelompok binaan', 'Skor', '55', '85'],
  ['Akses rumah tangga terhadap air bersih layak', 'KK', '0 KK', '300 KK'],
  ['Indeks kepuasan penerima manfaat program TJSL', 'Skor', '75', '90']
];

const monevIndicators = [];
for (let i = 1; i <= 32; i++) {
  const [indicatorName, unit, baseline, target] = indicatorTemplates[(i - 1) % indicatorTemplates.length];
  const prj = projects[(i - 1) % projects.length];
  const achievementPercent = randInt(48, 118);
  const ragStatus = achievementPercent >= 80 ? 'Hijau' : achievementPercent >= 60 ? 'Kuning' : 'Merah';
  monevIndicators.push({
    id: `ind-${i}`,
    code: `KPI-${String(i).padStart(3, '0')}`,
    programName: prj.title,
    indicatorName,
    unit,
    baseline,
    target,
    actual: `${achievementPercent}% dari target`,
    achievementPercent,
    frequency: pick(['Bulanan', 'Triwulanan', 'Semesteran']),
    pic: pick(['Bidang Perencanaan', 'Tim Monev', 'Bidang Implementasi', 'Bidang PUMK']),
    ragStatus
  });
}

// 14. Monev Issues & Grievance (40 rows — all with real coordinates for Google Maps!)
const issueDescriptions = [
  'Kerusakan tambatan perahu akibat terjangan ombak tinggi saat musim angin barat',
  'Permohonan warga untuk perbaikan panel solar cell yang tertutup ranting pohon',
  'Keterlambatan pengiriman material mesin pengemas akibat cuaca penyeberangan laut',
  'Usulan penambahan jadwal pendampingan pembukuan digital bagi anggota koperasi baru',
  'Perlu perbaikan saluran drainase di sekitar rumah produksi pakan ikan',
  'Konfirmasi ulang daftar hadir peserta pelatihan vokasi gelombang kedua'
];

const monevIssues = [];
for (let i = 1; i <= 40; i++) {
  const reg = regions[i % regions.length];
  const source = i % 3 === 0 ? 'Grievance Masyarakat' : i % 4 === 0 ? 'Survei Penerima' : 'Monev Lapangan';
  const status = pick(['Dalam Investigasi', 'Dalam Perbaikan', 'Selesai Verifikasi', 'Selesai Verifikasi']);
  monevIssues.push({
    id: `iss-${i}`,
    ticketNo: `${source === 'Grievance Masyarakat' ? 'GRV' : 'MNE'}-2026-${String(i).padStart(3, '0')}`,
    programTitle: projects[i % projects.length].title,
    location: `${reg.district}, ${reg.region}`,
    category: source === 'Grievance Masyarakat' ? 'Keluhan Warga (Grievance)' : pick(['Deviasi Fisik', 'Keterlambatan Anggaran', 'Kualitas Mutu']),
    description: issueDescriptions[i % issueDescriptions.length],
    pic: `${fullName()} (Tim Lapangan)`,
    deadline: `${String(randInt(1, 28)).padStart(2, '0')} Des 2026`,
    status,
    slaDaysRemaining: status === 'Selesai Verifikasi' ? 0 : randInt(1, 7),
    geotagCoord: jitterCoord(reg),
    source,
    recommendation: 'Tindak lanjut perbaikan teknis lapangan dengan berita acara foto geotag'
  });
}

// 15. Lessons Learned (15 rows)
const lessonsLearned = [];
for (let i = 1; i <= 15; i++) {
  const flg = flagships[(i - 1) % flagships.length];
  lessonsLearned.push({
    id: `ls-${i}`,
    year: 2026,
    sourceProgram: flg.name,
    pillar: pillars[(i - 1) % pillars.length],
    oecdDac: {
      relevance: randInt(82, 95),
      coherence: randInt(78, 92),
      effectiveness: randInt(76, 94),
      efficiency: randInt(75, 90),
      impact: randInt(80, 96),
      sustainability: randInt(76, 92)
    },
    finding: `Integrasi pendampingan teknis, kelembagaan koperasi, dan kontrak off-taker pada ${flg.name} mempercepat kemandirian kelompok secara signifikan.`,
    recommendation: `Replikasi skema ${flg.name} dengan penguatan kontrak off-taker ke wilayah Ring 1 lainnya pada RKAP 2027.`,
    appliedToRkap: i > 6
  });
}

// 16. Partners / Vendors (28 rows)
const partnerTypes = ['Perguruan Tinggi', 'LSM', 'Konsultan', 'Kelompok Masyarakat', 'Vendor'];
const partners = [];
for (let i = 1; i <= 28; i++) {
  const isBlacklisted = i % 13 === 0;
  partners.push({
    id: `v-${i}`,
    code: `MTR-${String(i).padStart(3, '0')}`,
    name: i <= partnerOrgs.length ? partnerOrgs[i - 1] : `${pick(['Yayasan', 'CV', 'PT', 'Lembaga', 'Koperasi'])} ${pick(groupSuffixes)} Babel ${i}`,
    type: partnerTypes[i % partnerTypes.length],
    legalityNo: i % 2 === 0 ? `AHU-00${randInt(10000, 99999)}.AH.01` : `NIB-912030${randInt(1000000, 9999999)}`,
    dueDiligenceStatus: isBlacklisted ? 'Ditolak' : 'Lulus Verifikasi',
    performanceScore: isBlacklisted ? randInt(38, 52) : randInt(78, 97),
    activeContracts: isBlacklisted ? 0 : randInt(1, 4),
    isBlacklisted
  });
}

// 17. Program Assets (45 rows)
const assetNames = [
  'Unit Cold Storage Kapasitas 10 Ton',
  'Rumah Kemasan & Mesin Grinder Lada',
  'Dermaga Apung Nelayan Tradisional',
  'Instalasi Air Bersih RO Tenaga Surya',
  'Mesin Produksi Pakan Ikan Pelet',
  'Rumah Pengeringan Hasil Laut Higienis',
  'Unit Puskesmas Keliling & Peralatan Medis',
  'Sentra Galeri & Peralatan Kriya Pewter'
];
const programAssets = [];
for (let i = 1; i <= 45; i++) {
  const reg = regions[i % regions.length];
  programAssets.push({
    id: `ast-${i}`,
    assetCode: `AST-CSR-2026-${String(i).padStart(3, '0')}`,
    assetName: `${assetNames[i % assetNames.length]} (${reg.district})`,
    programTitle: projects[i % projects.length].title,
    recipientCommunity: `${pick(groupPrefixes)} ${pick(groupSuffixes)}`,
    bastNo: `BAST/CSR/2026/${String(i).padStart(3, '0')}`,
    handoverDate: `${String(randInt(1, 27)).padStart(2, '0')} ${pick(['Jul', 'Agu', 'Sep', 'Okt', 'Nov'])} 2026`,
    value: randInt(75, 850) * 1000000,
    location: `${reg.district}, ${reg.region}`,
    geotagCoord: jitterCoord(reg),
    condition: i % 8 === 0 ? 'Perlu Perawatan' : i % 15 === 0 ? 'Rusak Ringan' : 'Baik',
    maintenanceSchedule: i % 8 === 0 ? 'Segera (Des 2026)' : 'Triwulan II 2027'
  });
}

// 18. Risks (20 rows)
const riskCategories = ['Fraud / COI', 'Kredit PUMK', 'Lingkungan', 'Sosial', 'Reputasi'];
const risks = [];
for (let i = 1; i <= 20; i++) {
  const cat = riskCategories[i % riskCategories.length];
  const level = i % 5 === 0 ? 'Tinggi' : i % 2 === 0 ? 'Menengah' : 'Rendah';
  risks.push({
    id: `rsk-${i}`,
    code: `RSK-${String(i).padStart(3, '0')}`,
    programName: projects[i % projects.length].title,
    category: cat,
    description:
      cat === 'Fraud / COI'
        ? 'Indikasi pengajuan berulang atau kemiripan struktur RAB antar pemohon'
        : cat === 'Kredit PUMK'
        ? 'Fluktuasi harga komoditas hasil laut/tambak berpotensi menaikkan DPD debitur'
        : 'Potensi keterlambatan jadwal akibat faktor cuaca ekstrem di wilayah operasi',
    level,
    mitigation: 'Validasi berlapis SBR, monitoring lapangan geotag, dan eskalasi komite risiko',
    status: level === 'Tinggi' ? 'Eskalasi' : level === 'Menengah' ? 'Dipantau' : 'Terkendali'
  });
}

// 19. Audit Logs (50 rows)
const auditModules = ['Perencanaan & RKAP', 'Seleksi Proposal', 'Implementasi PPM', 'Bantuan Charity', 'Koperasi & PUMK', 'Monitoring & Evaluasi', 'Registry SBR'];
const auditActions = [
  'Persetujuan Berjenjang (e-Sign)',
  'Scoring Kuantitatif Rubrik Terbobot',
  'Verifikasi Output Lapangan & Posting SAP FICO',
  'Rekonsiliasi Pembayaran Angsuran Virtual Account',
  'Validasi NIK Deduplikasi SBR',
  'Penutupan LPJ & Penerbitan BAST Digital'
];
const auditLogs = [];
for (let i = 1; i <= 50; i++) {
  auditLogs.push({
    id: `log-${i}`,
    timestamp: `${String(randInt(1, 27)).padStart(2, '0')} Nov 2026 ${String(randInt(8, 17)).padStart(2, '0')}:${String(randInt(10, 59)).padStart(2, '0')} WIB`,
    user: fullName(),
    role: pick(['Kepala Divisi CSR', 'Kabid Perencanaan', 'Kabid Implementasi', 'Analis PUMK', 'Reviewer Proposal', 'Koordinator Monev']),
    module: auditModules[i % auditModules.length],
    action: auditActions[i % auditActions.length],
    objectRef: `${pick(['RKA-2026', 'PROP-2026', 'SPK/CSR/2026', 'PUMK-2026', 'CHR-2026'])}-${String(i).padStart(3, '0')}`,
    ipAddress: `10.20.14.${randInt(20, 220)}`
  });
}

// 20. Aggregated Charts (derived cleanly from the real generated dataset!)
const pillarSum = { Ekonomi: 0, Lingkungan: 0, Sosial: 0, 'Hukum & Tata Kelola': 0 };
for (const r of rkapList) pillarSum[r.pillar] += r.budget;

const pillarDistributionData = [
  { name: 'Pilar Ekonomi (PPM & PUMK)', value: Number((pillarSum['Ekonomi'] / 1e9).toFixed(1)), color: '#0284c7' },
  { name: 'Pilar Lingkungan (Reklamasi)', value: Number((pillarSum['Lingkungan'] / 1e9).toFixed(1)), color: '#16a34a' },
  { name: 'Pilar Sosial (Charity & Kes)', value: Number((pillarSum['Sosial'] / 1e9).toFixed(1)), color: '#f59e0b' },
  { name: 'Pilar Hukum & Tata Kelola', value: Number((pillarSum['Hukum & Tata Kelola'] / 1e9).toFixed(1)), color: '#6366f1' }
];

const regMap = new Map();
for (const r of rkapList) {
  const mainReg = r.location.split(', ').pop() || r.location;
  const cur = regMap.get(mainReg) || { budget: 0, projects: 0 };
  cur.budget += r.budget;
  cur.projects += 1;
  regMap.set(mainReg, cur);
}
const regionalDistributionData = Array.from(regMap.entries())
  .map(([region, v]) => ({ region, budget: Number((v.budget / 1e9).toFixed(1)), projects: v.projects }))
  .sort((a, b) => b.budget - a.budget)
  .slice(0, 6);

const totalBudgetM = Number((rkapList.reduce((a, b) => a + b.budget, 0) / 1e9).toFixed(1));
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const monthlyBudgetData = months.map((month, idx) => {
  const frac = (idx + 1) / 12;
  const target = Number((totalBudgetM * frac).toFixed(1));
  const realisasi = Number((target * (0.86 + (idx / 12) * 0.08)).toFixed(1));
  const commitment = Number((target * 0.96).toFixed(1));
  return { month, target, realisasi, commitment };
});

const pumkNplTrendData = [
  { month: 'Jul', npl: 3.4, collectionRate: 91.8 },
  { month: 'Agu', npl: 3.1, collectionRate: 92.6 },
  { month: 'Sep', npl: 2.9, collectionRate: 93.5 },
  { month: 'Okt', npl: 2.7, collectionRate: 94.4 },
  { month: 'Nov', npl: 2.5, collectionRate: 95.3 },
  { month: 'Des (Est)', npl: 2.3, collectionRate: 96.1 }
];

const totalRows =
  socialMapping.length +
  rkapList.length +
  proposals.length +
  projects.length +
  charities.length +
  flagships.length +
  pumkApplications.length +
  pumkLoans.length +
  cooperatives.length +
  umkCatalog.length +
  monevIndicators.length +
  monevIssues.length +
  lessonsLearned.length +
  sbrDatabase.length +
  partners.length +
  programAssets.length +
  risks.length +
  auditLogs.length;

const snapshot = {
  meta: {
    version: '1.0.0',
    revision: 1,
    updatedAt: new Date().toISOString(),
    lastOperation: `Inisialisasi Snapshot Awal (${totalRows} record lintas seluruh modul KAK)`
  },
  monthlyBudgetData,
  pillarDistributionData,
  regionalDistributionData,
  pumkNplTrendData,
  socialMapping,
  rkapList,
  scoringRubric,
  approvalMatrix,
  proposals,
  projects,
  charities,
  flagships,
  pumkApplications,
  pumkLoans,
  cooperatives,
  umkCatalog,
  monevIndicators,
  monevIssues,
  lessonsLearned,
  sbrDatabase,
  partners,
  programAssets,
  risks,
  auditLogs
};

const dataDir = path.resolve(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });
const json = JSON.stringify(snapshot, null, 2) + '\n';
fs.writeFileSync(path.join(dataDir, 'snapshot.seed.json'), json, 'utf-8');
fs.writeFileSync(path.join(dataDir, 'snapshot.json'), json, 'utf-8');

console.log(`Generated ${totalRows} total rows into data/snapshot.json (${(json.length / 1024).toFixed(1)} KB)`);
console.log({
  socialMapping: socialMapping.length,
  rkapList: rkapList.length,
  proposals: proposals.length,
  projects: projects.length,
  charities: charities.length,
  flagships: flagships.length,
  pumkApplications: pumkApplications.length,
  pumkLoans: pumkLoans.length,
  cooperatives: cooperatives.length,
  umkCatalog: umkCatalog.length,
  monevIndicators: monevIndicators.length,
  monevIssues: monevIssues.length,
  lessonsLearned: lessonsLearned.length,
  sbrDatabase: sbrDatabase.length,
  partners: partners.length,
  programAssets: programAssets.length,
  risks: risks.length,
  auditLogs: auditLogs.length
});
