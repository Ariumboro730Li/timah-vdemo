import * as XLSX from 'xlsx';
import {
  ImportDatasetType,
  SocialMappingRegion,
  RkapItem,
  ProposalItem,
  SbrBeneficiary,
  PumkLoan,
  PartnerVendor
} from '../types';

export interface ImportDatasetConfig {
  type: ImportDatasetType;
  label: string;
  kakRef: string;
  description: string;
  columns: string[];
  sampleRows: Record<string, string | number>[];
}

export const IMPORT_DATASET_CONFIGS: Record<ImportDatasetType, ImportDatasetConfig> = {
  social_mapping: {
    type: 'social_mapping',
    label: 'Data Publik Social Mapping (BPS / DTSEN / Podes)',
    kakRef: 'KAK P-02 & Bab 13',
    description: 'Impor data demografi, kemiskinan, jumlah UMK, dan prioritas kebutuhan wilayah operasi Ring 1/2/3.',
    columns: ['Wilayah', 'Kecamatan', 'Ring', 'Populasi', 'Angka_Kemiskinan', 'Jumlah_UMK', 'Kebutuhan_Prioritas', 'Sumber_Data', 'Koordinat_Geotag'],
    sampleRows: [
      {
        Wilayah: 'Bangka Induk',
        Kecamatan: 'Kec. Sungailiat & Belinyu',
        Ring: 'Ring 1',
        Populasi: 61200,
        Angka_Kemiskinan: 5.9,
        Jumlah_UMK: 580,
        Kebutuhan_Prioritas: 'Pengolahan hasil perikanan, pelatihan vokasi pemuda, sanitasi pesisir',
        Sumber_Data: 'BPS / Podes',
        Koordinat_Geotag: '-1.8562, 106.1190'
      },
      {
        Wilayah: 'Belitung',
        Kecamatan: 'Kec. Tanjungpandan & Sijuk',
        Ring: 'Ring 2',
        Populasi: 49300,
        Angka_Kemiskinan: 5.4,
        Jumlah_UMK: 510,
        Kebutuhan_Prioritas: 'Ekowisata pesisir berkelanjutan, sertifikasi halal UMKM kuliner',
        Sumber_Data: 'DTSEN',
        Koordinat_Geotag: '-2.7418, 107.6380'
      }
    ]
  },
  rkap: {
    type: 'rkap',
    label: 'Program & Anggaran RKAP TJSL',
    kakRef: 'KAK P-05',
    description: 'Impor massal daftar program kerja tahunan, pilar TJSL, tagging SDGs, lokasi Ring, dan pagu anggaran.',
    columns: ['Kode', 'Judul_Program', 'Pilar', 'SDGs', 'Lokasi', 'Ring', 'Anggaran', 'Target_KPI', 'Mitra_Sinergi'],
    sampleRows: [
      {
        Kode: 'RKA-2026-006',
        Judul_Program: 'Digitalisasi Pembukuan & Akses Pasar Koperasi Nelayan Sungailiat',
        Pilar: 'Ekonomi',
        SDGs: 'SDG 8; SDG 14',
        Lokasi: 'Sungailiat, Bangka',
        Ring: 'Ring 1',
        Anggaran: 680000000,
        Target_KPI: '5 koperasi terdigitalisasi, omzet naik 30%',
        Mitra_Sinergi: 'Dinas Koperasi Kab. Bangka'
      },
      {
        Kode: 'RKA-2026-007',
        Judul_Program: 'Konservasi Terumbu Karang & Transplantasi Biota Laut Belinyu',
        Pilar: 'Lingkungan',
        SDGs: 'SDG 14; SDG 13',
        Lokasi: 'Belinyu, Bangka',
        Ring: 'Ring 1',
        Anggaran: 540000000,
        Target_KPI: '1.200 modul terumbu karang aktif, tutupan karang naik 25%',
        Mitra_Sinergi: 'Pokmaswas Pesisir Belinyu'
      }
    ]
  },
  proposal: {
    type: 'proposal',
    label: 'Batch Proposal Masuk / Bantuan Charity (TEO & OCR)',
    kakRef: 'KAK S-01 & C-01',
    description: 'Impor pengajuan proposal dan bantuan sosial dari sistem eksisting (TEO) atau hasil OCR surat masuk dengan cek deduplikasi NIK otomatis.',
    columns: ['Pemohon', 'NIK', 'Legalitas', 'Kanal', 'Jenis_Program', 'Kategori', 'Nilai_Usulan', 'Lokasi', 'Ring', 'Koordinat_Geotag'],
    sampleRows: [
      {
        Pemohon: 'Kelompok Wanita Tani Melati Sungailiat',
        NIK: '1901055209870001',
        Legalitas: 'SK-LURAH/2025/18',
        Kanal: 'Aplikasi TEO',
        Jenis_Program: 'Program PPM',
        Kategori: 'Pemberdayaan Pertanian',
        Nilai_Usulan: 65000000,
        Lokasi: 'Sungailiat, Bangka',
        Ring: 'Ring 1',
        Koordinat_Geotag: '-1.8590, 106.1215'
      },
      {
        Pemohon: 'Posyandu Mawar Desa Air Lintang',
        NIK: '1905024103900002',
        Legalitas: 'SK-KADES/2025/09',
        Kanal: 'Surat OCR',
        Jenis_Program: 'Bantuan Charity',
        Kategori: 'Kesehatan',
        Nilai_Usulan: 19500000,
        Lokasi: 'Tempilang, Bangka Barat',
        Ring: 'Ring 1',
        Koordinat_Geotag: '-2.1045, 105.6890'
      },
      {
        Pemohon: 'Panitia Renovasi Musholla (Uji Duplikasi SBR)',
        NIK: '1901026607810004',
        Legalitas: 'SK-CAMAT/09/2025',
        Kanal: 'Import Batch',
        Jenis_Program: 'Bantuan Charity',
        Kategori: 'Keagamaan',
        Nilai_Usulan: 25000000,
        Lokasi: 'Pangkalpinang',
        Ring: 'Ring 3',
        Koordinat_Geotag: '-2.1316, 106.1169'
      }
    ]
  },
  sbr: {
    type: 'sbr',
    label: 'Migrasi Data Historis Penerima Manfaat (SBR)',
    kakRef: 'KAK 7.6 & Bab 13',
    description: 'Migrasi database penerima historis dari spreadsheet/sistem lama ke Single Beneficiary Registry dengan data cleansing & deduplikasi NIK.',
    columns: ['NIK', 'NPWP_NIB', 'Nama', 'Alamat', 'Ring', 'Program_Terakhir', 'Tahun', 'Nilai_Bantuan', 'Status_Graduasi'],
    sampleRows: [
      {
        NIK: '1904011805790003',
        NPWP_NIB: 'NIB-0220107742110',
        Nama: 'M. Iskandar (Ketua Pokdakan)',
        Alamat: 'Desa Kurau Barat, Kec. Koba, Bangka Tengah',
        Ring: 'Ring 1',
        Program_Terakhir: 'Bantuan Bibit Ikan Kakap & Keramba',
        Tahun: 2024,
        Nilai_Bantuan: 35000000,
        Status_Graduasi: 'Mandiri'
      },
      {
        NIK: '1906026004840001',
        NPWP_NIB: '76.812.004.5-305.000',
        Nama: 'Kartini (Kelompok Pengrajin Daun Nipah)',
        Alamat: 'Kec. Manggar, Belitung Timur',
        Ring: 'Ring 1',
        Program_Terakhir: 'Pelatihan & Alat Kemas Anyaman',
        Tahun: 2023,
        Nilai_Bantuan: 18000000,
        Status_Graduasi: 'Berkembang'
      },
      {
        NIK: '1901042508820003',
        NPWP_NIB: '74.128.445.1-304.000',
        Nama: 'Baharuddin (Duplikat Eksisting)',
        Alamat: 'Ds. Sukadamai, Toboali',
        Ring: 'Ring 1',
        Program_Terakhir: 'Bantuan Jaring Nelayan',
        Tahun: 2024,
        Nilai_Bantuan: 25000000,
        Status_Graduasi: 'Mandiri'
      }
    ]
  },
  pumk: {
    type: 'pumk',
    label: 'Portofolio Pinjaman PUMK & Koperasi (MCOS / PDC)',
    kakRef: 'KAK K-01 & Bab 13',
    description: 'Impor saldo baki debet pinjaman mitra binaan, nomor Virtual Account, DPD, dan rekonsiliasi saldo portofolio.',
    columns: ['No_Akad', 'Virtual_Account', 'Nama_UMK', 'NIK', 'Bidang_Usaha', 'Lokasi', 'Plafon', 'Sisa_Pokok', 'Angsuran_Bulanan', 'DPD', 'Skor_Kredit'],
    sampleRows: [
      {
        No_Akad: 'PUMK-2026-101',
        Virtual_Account: '887910029104',
        Nama_UMK: 'Usaha Kopi & Lada Bubuk Manggar Jaya',
        NIK: '1906011207830002',
        Bidang_Usaha: 'Agribisnis & Olahan',
        Lokasi: 'Manggar, Belitung Timur',
        Plafon: 60000000,
        Sisa_Pokok: 48000000,
        Angsuran_Bulanan: 1850000,
        DPD: 0,
        Skor_Kredit: 86
      },
      {
        No_Akad: 'PUMK-2026-102',
        Virtual_Account: '887910029118',
        Nama_UMK: 'Galangan Perahu Kayu Tradisional Kundur',
        NIK: '2102031904770001',
        Bidang_Usaha: 'Jasa Perkapalan Rakyat',
        Lokasi: 'Kundur, Kep. Riau',
        Plafon: 80000000,
        Sisa_Pokok: 62000000,
        Angsuran_Bulanan: 2500000,
        DPD: 12,
        Skor_Kredit: 74
      }
    ]
  },
  mitra: {
    type: 'mitra',
    label: 'Master Data Mitra Pelaksana / Vendor',
    kakRef: 'KAK I-02 & 7.6',
    description: 'Impor daftar LSM, Perguruan Tinggi, Konsultan, dan Vendor pelaksana program beserta legalitas & skor rekam jejak.',
    columns: ['Kode', 'Nama_Mitra', 'Jenis', 'No_Legalitas', 'Skor_Kinerja', 'Kontrak_Aktif'],
    sampleRows: [
      {
        Kode: 'MTR-004',
        Nama_Mitra: 'Politeknik Manufaktur Negeri Bangka Belitung',
        Jenis: 'Perguruan Tinggi',
        No_Legalitas: 'SK-KEMENDIKBUD/POLMAN',
        Skor_Kinerja: 92,
        Kontrak_Aktif: 1
      },
      {
        Kode: 'MTR-005',
        Nama_Mitra: 'Yayasan Bina Tani Nusantara Babel',
        Jenis: 'LSM',
        No_Legalitas: 'AHU-0041928.AH.01.04',
        Skor_Kinerja: 85,
        Kontrak_Aktif: 1
      }
    ]
  }
};

export interface ParsedImportRow {
  rowIndex: number;
  raw: Record<string, any>;
  status: 'valid' | 'duplicate' | 'error';
  message: string;
  reconciledAmount?: number;
}

export function parseNumber(val: any): number {
  if (typeof val === 'number') return val;
  const cleaned = String(val ?? '').replace(/[^0-9.-]+/g, '');
  const parsed = Number(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export async function parseUploadedFile(file: File): Promise<Record<string, any>[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'json') {
    const text = await file.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  }
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
}

export function downloadTemplateFile(type: ImportDatasetType, format: 'xlsx' | 'csv') {
  const cfg = IMPORT_DATASET_CONFIGS[type];
  const ws = XLSX.utils.json_to_sheet(cfg.sampleRows, { header: cfg.columns });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type.toUpperCase());
  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `template_${type}_kak_timah.csv`);
  } else {
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, `template_${type}_kak_timah.xlsx`);
  }
}

export function exportRowsToExcel(rows: Record<string, any>[], sheetName: string, fileName: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateDryRun(
  type: ImportDatasetType,
  rows: Record<string, any>[],
  existingKeys: {
    sbrNiks: Set<string>;
    rkapCodes: Set<string>;
    pumkContracts: Set<string>;
    partnerCodes: Set<string>;
  }
): ParsedImportRow[] {
  const seenInBatch = new Set<string>();

  return rows.map((raw, idx) => {
    const rowIndex = idx + 1;

    if (type === 'social_mapping') {
      const region = String(raw.Wilayah || raw.region || '').trim();
      const district = String(raw.Kecamatan || raw.district || '').trim();
      if (!region || !district) {
        return { rowIndex, raw, status: 'error', message: 'Kolom Wilayah dan Kecamatan wajib diisi' };
      }
      return { rowIndex, raw, status: 'valid', message: 'Valid — Siap impor ke Peta Kebutuhan Wilayah' };
    }

    if (type === 'rkap') {
      const code = String(raw.Kode || raw.code || '').trim();
      const title = String(raw.Judul_Program || raw.title || '').trim();
      const budget = parseNumber(raw.Anggaran || raw.budget);
      if (!code || !title || budget <= 0) {
        return { rowIndex, raw, status: 'error', message: 'Kode, Judul Program, dan Anggaran (>0) wajib diisi' };
      }
      if (existingKeys.rkapCodes.has(code) || seenInBatch.has(code)) {
        return { rowIndex, raw, status: 'duplicate', message: `Kode RKAP ${code} sudah terdaftar (duplikat)`, reconciledAmount: budget };
      }
      seenInBatch.add(code);
      return { rowIndex, raw, status: 'valid', message: 'Valid — Siap masuk RKAP', reconciledAmount: budget };
    }

    if (type === 'proposal') {
      const applicant = String(raw.Pemohon || raw.applicant || '').trim();
      const nik = String(raw.NIK || raw.nik || '').replace(/\D/g, '');
      const amount = parseNumber(raw.Nilai_Usulan || raw.requestedAmount);
      if (!applicant || nik.length !== 16 || amount <= 0) {
        return { rowIndex, raw, status: 'error', message: 'Pemohon wajib ada, NIK harus 16 digit, Nilai Usulan > 0' };
      }
      if (existingKeys.sbrNiks.has(nik)) {
        return {
          rowIndex,
          raw,
          status: 'duplicate',
          message: `Peringatan SBR: NIK ${nik} terdeteksi di riwayat bantuan sebelumnya (akan ditandai flag deduplikasi)`,
          reconciledAmount: amount
        };
      }
      seenInBatch.add(nik);
      return { rowIndex, raw, status: 'valid', message: 'Valid & NIK Unik — Lolos Screening Awal', reconciledAmount: amount };
    }

    if (type === 'sbr') {
      const nik = String(raw.NIK || raw.nik || '').replace(/\D/g, '');
      const name = String(raw.Nama || raw.name || '').trim();
      const amount = parseNumber(raw.Nilai_Bantuan || raw.amount);
      if (nik.length !== 16 || !name) {
        return { rowIndex, raw, status: 'error', message: 'NIK wajib 16 digit valid dan Nama wajib diisi' };
      }
      if (existingKeys.sbrNiks.has(nik) || seenInBatch.has(nik)) {
        return { rowIndex, raw, status: 'duplicate', message: `Duplikasi NIK ${nik} — dilewati otomatis saat cut-over`, reconciledAmount: amount };
      }
      seenInBatch.add(nik);
      return { rowIndex, raw, status: 'valid', message: 'Valid — Siap masuk Single Beneficiary Registry', reconciledAmount: amount };
    }

    if (type === 'pumk') {
      const contractNo = String(raw.No_Akad || raw.contractNo || '').trim();
      const borrower = String(raw.Nama_UMK || raw.borrowerName || '').trim();
      const remaining = parseNumber(raw.Sisa_Pokok || raw.remainingPrincipal);
      if (!contractNo || !borrower || remaining < 0) {
        return { rowIndex, raw, status: 'error', message: 'No_Akad dan Nama_UMK wajib diisi dengan saldo valid' };
      }
      if (existingKeys.pumkContracts.has(contractNo) || seenInBatch.has(contractNo)) {
        return { rowIndex, raw, status: 'duplicate', message: `No Akad ${contractNo} sudah ada di portofolio`, reconciledAmount: remaining };
      }
      seenInBatch.add(contractNo);
      return { rowIndex, raw, status: 'valid', message: 'Valid — Saldo ter-rekonsiliasi', reconciledAmount: remaining };
    }

    // mitra
    const code = String(raw.Kode || raw.code || '').trim();
    const name = String(raw.Nama_Mitra || raw.name || '').trim();
    if (!code || !name) {
      return { rowIndex, raw, status: 'error', message: 'Kode dan Nama_Mitra wajib diisi' };
    }
    if (existingKeys.partnerCodes.has(code) || seenInBatch.has(code)) {
      return { rowIndex, raw, status: 'duplicate', message: `Kode Mitra ${code} sudah terdaftar` };
    }
    seenInBatch.add(code);
    return { rowIndex, raw, status: 'valid', message: 'Valid — Siap masuk Master Mitra Pelaksana' };
  });
}

export function transformValidatedRows(
  type: ImportDatasetType,
  validatedRows: ParsedImportRow[],
  includeDuplicateFlagsForProposals = true
) {
  const usable = validatedRows.filter((r) =>
    type === 'proposal' && includeDuplicateFlagsForProposals
      ? r.status === 'valid' || r.status === 'duplicate'
      : r.status === 'valid'
  );

  if (type === 'social_mapping') {
    return usable.map((u, i): SocialMappingRegion => ({
      id: `sm-imp-${Date.now()}-${i}`,
      region: String(u.raw.Wilayah || u.raw.region),
      district: String(u.raw.Kecamatan || u.raw.district),
      ring: (['Ring 1', 'Ring 2', 'Ring 3'].includes(u.raw.Ring) ? u.raw.Ring : 'Ring 1') as SocialMappingRegion['ring'],
      population: parseNumber(u.raw.Populasi) || 25000,
      povertyRate: parseNumber(u.raw.Angka_Kemiskinan) || 6.0,
      umkCount: parseNumber(u.raw.Jumlah_UMK) || 200,
      priorityNeeds: String(u.raw.Kebutuhan_Prioritas || 'Pemberdayaan ekonomi lokal'),
      stakeholderPosition: 'Tinggi-Tinggi (Kelola Erat)',
      productionContext: 'Hasil Impor Data Publik Terjadwal',
      dataSource: (['BPS / Podes', 'DTSEN', 'Survei Lapangan'].includes(u.raw.Sumber_Data) ? u.raw.Sumber_Data : 'BPS / Podes') as SocialMappingRegion['dataSource'],
      geotagCoord: String(u.raw.Koordinat_Geotag || '-2.1316, 106.1169')
    }));
  }

  if (type === 'rkap') {
    return usable.map((u, i): RkapItem => ({
      id: `rka-imp-${Date.now()}-${i}`,
      code: String(u.raw.Kode),
      title: String(u.raw.Judul_Program),
      pillar: (['Ekonomi', 'Sosial', 'Lingkungan', 'Hukum & Tata Kelola'].includes(u.raw.Pilar) ? u.raw.Pilar : 'Ekonomi') as RkapItem['pillar'],
      sdgs: String(u.raw.SDGs || 'SDG 8').split(/[;,]/).map((s) => s.trim()).filter(Boolean),
      location: String(u.raw.Lokasi || 'Bangka Belitung'),
      ring: (['Ring 1', 'Ring 2', 'Ring 3'].includes(u.raw.Ring) ? u.raw.Ring : 'Ring 1') as RkapItem['ring'],
      budget: parseNumber(u.raw.Anggaran),
      committedBudget: 0,
      realizedBudget: 0,
      priorityScore: 82,
      status: 'Draft',
      version: 'v1.0 (Import)',
      kpiTarget: String(u.raw.Target_KPI || 'Capaian terukur sesuai RKAP'),
      baseline: 'Baseline impor RKAP 2026',
      synergyPartner: String(u.raw.Mitra_Sinergi || 'Pemda Setempat'),
      theoryOfChange: {
        input: `Anggaran Rp ${parseNumber(u.raw.Anggaran).toLocaleString('id-ID')}`,
        activity: `Pelaksanaan ${u.raw.Judul_Program}`,
        output: String(u.raw.Target_KPI || 'Output sesuai target'),
        outcome: 'Peningkatan kapasitas & kesejahteraan masyarakat sasaran',
        impact: 'Dampak sosial-ekonomi berkelanjutan di wilayah operasi',
        riskSafeguard: 'Pemantauan risiko lapangan & kepatuhan tata kelola'
      }
    }));
  }

  if (type === 'proposal') {
    return usable.map((u, i): ProposalItem => {
      const isDup = u.status === 'duplicate';
      return {
        id: `prop-imp-${Date.now()}-${i}`,
        ticketNo: `PROP-2026-IMP${String(i + 1).padStart(2, '0')}`,
        applicant: String(u.raw.Pemohon),
        nik: String(u.raw.NIK).replace(/\D/g, ''),
        legalityNo: String(u.raw.Legalitas || 'Terlampir'),
        channel: (['Portal Web/Mobile', 'Aplikasi TEO', 'Surat OCR', 'Fast-Track Darurat', 'Import Batch'].includes(u.raw.Kanal)
          ? u.raw.Kanal
          : 'Import Batch') as ProposalItem['channel'],
        programType: (['Program PPM', 'Bantuan Charity', 'Program Flagship'].includes(u.raw.Jenis_Program)
          ? u.raw.Jenis_Program
          : 'Program PPM') as ProposalItem['programType'],
        category: String(u.raw.Kategori || 'Pemberdayaan Masyarakat'),
        requestedAmount: parseNumber(u.raw.Nilai_Usulan),
        location: String(u.raw.Lokasi || 'Bangka Belitung'),
        ring: (['Ring 1', 'Ring 2', 'Ring 3'].includes(u.raw.Ring) ? u.raw.Ring : 'Ring 1') as ProposalItem['ring'],
        sbrStatus: isDup ? 'Duplikasi Terdeteksi' : 'Unik (Bersih)',
        nlpSimilarityPercent: isDup ? 82 : 14,
        adminScreeningStatus: isDup ? 'Gugur' : 'Lolos',
        reviewerScores: isDup
          ? [{ reviewerName: 'Mesin Deduplikasi Import', date: '27 Nov 2026', totalScore: 48, notes: 'Terdeteksi duplikasi NIK saat impor batch' }]
          : [],
        score: isDup ? 48 : undefined,
        recommendation: isDup ? 'Ditolak' : 'Menunggu Review',
        committeeDecision: isDup ? 'Ditolak' : 'Belum Rapat',
        approvalStatus: isDup ? 'Ditolak' : 'Menunggu',
        dateSubmitted: '27 Nov 2026 (Import)',
        geotagCoord: String(u.raw.Koordinat_Geotag || '-2.1316, 106.1169')
      };
    });
  }

  if (type === 'sbr') {
    return usable.map((u): SbrBeneficiary => ({
      nik: String(u.raw.NIK).replace(/\D/g, ''),
      npwpOrNib: String(u.raw.NPWP_NIB || ''),
      name: String(u.raw.Nama),
      address: String(u.raw.Alamat || 'Kep. Bangka Belitung'),
      ring: (['Ring 1', 'Ring 2', 'Ring 3'].includes(u.raw.Ring) ? u.raw.Ring : 'Ring 1') as SbrBeneficiary['ring'],
      isBlacklisted: false,
      graduationStatus: (['Pemula', 'Berkembang', 'Mandiri', 'Selesai LPJ'].includes(u.raw.Status_Graduasi)
        ? u.raw.Status_Graduasi
        : 'Selesai LPJ') as SbrBeneficiary['graduationStatus'],
      programHistory: [
        {
          year: parseNumber(u.raw.Tahun) || 2024,
          programName: String(u.raw.Program_Terakhir || 'Data Migrasi Historis'),
          type: 'Migrasi Data Historis',
          amount: parseNumber(u.raw.Nilai_Bantuan),
          status: 'Teraudit & Termigrasi'
        }
      ]
    }));
  }

  if (type === 'pumk') {
    return usable.map((u, i): PumkLoan => {
      const dpd = parseNumber(u.raw.DPD);
      const col: PumkLoan['collectibility'] =
        dpd === 0 ? 'Lancar' : dpd <= 30 ? 'Pemantauan' : dpd <= 90 ? 'Kurang Lancar' : dpd <= 180 ? 'Diragukan' : 'Macet';
      return {
        id: `pumk-imp-${Date.now()}-${i}`,
        contractNo: String(u.raw.No_Akad),
        vaNumber: String(u.raw.Virtual_Account || `8879100${Math.floor(10000 + Math.random() * 89999)}`),
        borrowerName: String(u.raw.Nama_UMK),
        nik: String(u.raw.NIK || '').replace(/\D/g, ''),
        businessType: String(u.raw.Bidang_Usaha || 'UMK Binaan'),
        location: String(u.raw.Lokasi || 'Bangka Belitung'),
        geotagCoord: '-2.1316, 106.1169',
        ceiling: parseNumber(u.raw.Plafon),
        remainingPrincipal: parseNumber(u.raw.Sisa_Pokok),
        monthlyInstallment: parseNumber(u.raw.Angsuran_Bulanan) || 1500000,
        tenorMonths: 36,
        paidInstallments: 6,
        dpd,
        collectibility: col,
        creditScore: parseNumber(u.raw.Skor_Kredit) || 80,
        lastPaymentDate: '25 Nov 2026 (Migrasi MCOS)',
        graduationStatus: dpd === 0 ? 'Berkembang' : 'Pemula'
      };
    });
  }

  // mitra
  return usable.map((u, i): PartnerVendor => ({
    id: `mtr-imp-${Date.now()}-${i}`,
    code: String(u.raw.Kode),
    name: String(u.raw.Nama_Mitra),
    type: (['LSM', 'Perguruan Tinggi', 'Konsultan', 'Kelompok Masyarakat', 'Vendor'].includes(u.raw.Jenis)
      ? u.raw.Jenis
      : 'LSM') as PartnerVendor['type'],
    legalityNo: String(u.raw.No_Legalitas || 'Terverifikasi'),
    dueDiligenceStatus: 'Lulus Verifikasi',
    performanceScore: parseNumber(u.raw.Skor_Kinerja) || 85,
    activeContracts: parseNumber(u.raw.Kontrak_Aktif) || 0,
    isBlacklisted: false
  }));
}
