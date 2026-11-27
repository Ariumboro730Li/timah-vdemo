import React, { useState } from 'react';
import { SbrBeneficiary, ImportDatasetType } from '../../types';
import {
  Search,
  UserCheck,
  ShieldCheck,
  History,
  Upload,
  Ban,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ImportDataModal } from '../common/ImportDataModal';
import { PaginationBar } from '../common/PaginationBar';
import { useAppState } from '../../context/AppStateContext';
import { getRolePolicy, maskNik } from '../../utils/rbac';

export const SbrView: React.FC = () => {
  const {
    userRole,
    sbrDatabase,
    partners,
    programAssets,
    risks,
    toggleSbrBlacklist,
    togglePartnerBlacklist
  } = useAppState();
  const policy = getRolePolicy(userRole);

  const [activeTab, setActiveTab] = useState<'sbr' | 'mitra' | 'aset' | 'risiko'>('sbr');
  const [searchTerm, setSearchTerm] = useState('');
  const [sbrPage, setSbrPage] = useState(1);
  const [sbrPageSize, setSbrPageSize] = useState(5);
  const [mitraPage, setMitraPage] = useState(1);
  const [mitraPageSize, setMitraPageSize] = useState(5);
  const [asetPage, setAsetPage] = useState(1);
  const [asetPageSize, setAsetPageSize] = useState(5);
  const [riskPage, setRiskPage] = useState(1);
  const [riskPageSize, setRiskPageSize] = useState(5);
  const [selectedRecord, setSelectedRecord] = useState<SbrBeneficiary | null>(null);
  const [detailSbrNik, setDetailSbrNik] = useState<string | null>(null);
  const [detailPartnerId, setDetailPartnerId] = useState<string | null>(null);
  const [detailAssetId, setDetailAssetId] = useState<string | null>(null);
  const [detailRiskId, setDetailRiskId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importType, setImportType] = useState<ImportDatasetType>('sbr');

  const detailSbr = detailSbrNik ? sbrDatabase.find((b) => b.nik === detailSbrNik) || null : null;
  const detailPartner = detailPartnerId ? partners.find((p) => p.id === detailPartnerId) || null : null;
  const detailAsset = detailAssetId ? programAssets.find((a) => a.id === detailAssetId) || null : null;
  const detailRisk = detailRiskId ? risks.find((r) => r.id === detailRiskId) || null : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSelectedRecord(null);
      return;
    }
    const found = sbrDatabase.find(
      (b) => b.nik.includes(searchTerm.trim()) || b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSelectedRecord(found || null);
  };

  return (
    <div className="space-y-6">
      {/* Tabs & Import Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('sbr')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'sbr' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Single Beneficiary Registry ({sbrDatabase.length})
          </button>
          <button
            onClick={() => setActiveTab('mitra')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'mitra' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mitra Pelaksana / Vendor ({partners.length})
          </button>
          <button
            onClick={() => setActiveTab('aset')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'aset' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Aset Hasil Program ({programAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('risiko')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'risiko' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Risk Register & Anti-Fraud ({risks.length})
          </button>
        </div>

        {(activeTab === 'sbr' || activeTab === 'mitra') &&
          policy.allowedImportTypes.includes(activeTab === 'sbr' ? 'sbr' : 'mitra') && (
            <button
              onClick={() => {
                setImportType(activeTab === 'sbr' ? 'sbr' : 'mitra');
                setImportOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-900 font-semibold inline-flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>{activeTab === 'sbr' ? 'Import Migrasi SBR' : 'Import Data Mitra'}</span>
            </button>
          )}
      </div>

      {/* TAB 1: SINGLE BENEFICIARY REGISTRY */}
      {activeTab === 'sbr' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-emerald-950">Single Beneficiary Registry (SBR) — Kepatuhan UU PDP & Zero Duplication</h2>
              <p className="text-emerald-900 mt-0.5">
                Identitas tunggal penerima manfaat lintas program (PPM, Charity, PUMK) dan lintas tahun dengan deduplikasi NIK otomatis.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-white text-emerald-800 border border-emerald-200 font-semibold flex-shrink-0">
              {policy.canViewUnmaskedPii ? '✓ Dukcapil e-KYC (NIK Penuh)' : '✓ UU PDP: Masking NIK Aktif'}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <form onSubmit={handleSearch} className="max-w-2xl flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Masukkan 16 Digit NIK atau Nama Penerima Manfaat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Periksa NIK</span>
              </button>
            </form>

            {selectedRecord && (
              <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-400">Profil Terverifikasi SBR</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedRecord.name}</h3>
                    <div className="font-mono text-emerald-700 font-semibold">
                      NIK: {maskNik(selectedRecord.nik, userRole)} {selectedRecord.npwpOrNib ? `• ${selectedRecord.npwpOrNib}` : ''}
                    </div>
                    <p className="text-slate-600 mt-1">{selectedRecord.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-semibold ${
                        selectedRecord.isBlacklisted ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{selectedRecord.isBlacklisted ? 'BLACKLIST AKTIF' : 'Valid Dukcapil'}</span>
                    </span>
                    <span className="text-slate-600">Status Graduasi: <strong>{selectedRecord.graduationStatus}</strong></span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Riwayat Penerimaan Bantuan Lintas Program & Tahun:</span>
                  </span>
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Tahun</th>
                          <th className="py-2.5 px-3">Nama Program</th>
                          <th className="py-2.5 px-3">Jenis Program</th>
                          <th className="py-2.5 px-3">Nilai Bantuan</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRecord.programHistory.map((hist, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{hist.year}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{hist.programName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{hist.type}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">Rp {hist.amount.toLocaleString('id-ID')}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">{hist.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Master Database Penerima Manfaat (SBR)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-3 px-4">NIK (Terverifikasi)</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Domisili</th>
                    <th className="py-3 px-4">Riwayat Terakhir</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sbrDatabase.slice((sbrPage - 1) * sbrPageSize, sbrPage * sbrPageSize).map((b) => (
                    <tr key={b.nik} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-sky-800">
                        <button
                          type="button"
                          onClick={() => setDetailSbrNik(b.nik)}
                          className="hover:underline text-left"
                        >
                          {maskNik(b.nik, userRole)}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => setDetailSbrNik(b.nik)}
                          className="hover:text-sky-700 hover:underline text-left"
                        >
                          {b.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{b.address}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {b.programHistory[0]?.programName} ({b.programHistory[0]?.year})
                      </td>
                      <td className="py-3 px-4">
                        {b.isBlacklisted ? (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded">Blacklist</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded">{b.graduationStatus}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailSbrNik(b.nik)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Detail</span>
                          </button>
                          {policy.canToggleSbrBlacklist && (
                            <button
                              onClick={() => toggleSbrBlacklist(b.nik)}
                              className={`px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1 ${
                                b.isBlacklisted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{b.isBlacklisted ? 'Pulihkan' : 'Blacklist'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              totalItems={sbrDatabase.length}
              currentPage={sbrPage}
              pageSize={sbrPageSize}
              onPageChange={setSbrPage}
              onPageSizeChange={setSbrPageSize}
            />
          </div>
        </div>
      )}

      {/* TAB 2: MITRA PELAKSANA / VENDOR */}
      {activeTab === 'mitra' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Manajemen Mitra Pelaksana & Vendor (Due Diligence, Kinerja & Blacklist)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Kode & Nama Mitra</th>
                  <th className="py-3 px-4">Kategori & Legalitas</th>
                  <th className="py-3 px-4">Due Diligence</th>
                  <th className="py-3 px-4 text-center">Skor Kinerja</th>
                  <th className="py-3 px-4 text-center">Kontrak Aktif</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partners.slice((mitraPage - 1) * mitraPageSize, mitraPage * mitraPageSize).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setDetailPartnerId(p.id)}
                        className="font-mono text-sky-800 font-bold hover:underline text-left block"
                      >
                        {p.code}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailPartnerId(p.id)}
                        className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{p.type}</div>
                      <div className="font-mono text-slate-500">{p.legalityNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded font-semibold border ${
                          p.isBlacklisted
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {p.isBlacklisted ? 'Blacklist' : p.dueDiligenceStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{p.performanceScore} / 100</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{p.activeContracts}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailPartnerId(p.id)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detail</span>
                        </button>
                        {policy.canTogglePartnerBlacklist && (
                          <button
                            onClick={() => togglePartnerBlacklist(p.id)}
                            className={`px-3 py-1 rounded-lg font-semibold ${
                              p.isBlacklisted
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {p.isBlacklisted ? 'Cabut Blacklist' : 'Blacklist'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar totalItems={partners.length} currentPage={mitraPage} pageSize={mitraPageSize} onPageChange={setMitraPage} onPageSizeChange={setMitraPageSize} />
        </div>
      )}

      {/* TAB 3: ASET HASIL PROGRAM */}
      {activeTab === 'aset' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Manajemen Aset Hasil Program yang Diserahkan ke Masyarakat (BAST)</h3>
            <p className="text-slate-500">Terisi otomatis saat proyek di Modul Implementasi menyelesaikan penutupan LPJ & BAST</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Kode Aset & Nama</th>
                  <th className="py-3 px-4">Penerima & No BAST</th>
                  <th className="py-3 px-4">Nilai Perolehan</th>
                  <th className="py-3 px-4">Lokasi & Geotag</th>
                  <th className="py-3 px-4">Kondisi & Jadwal Rawat</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programAssets.slice((asetPage - 1) * asetPageSize, asetPage * asetPageSize).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setDetailAssetId(a.id)}
                        className="font-mono font-bold text-sky-800 hover:underline text-left block"
                      >
                        {a.assetCode}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailAssetId(a.id)}
                        className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                      >
                        {a.assetName}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{a.recipientCommunity}</div>
                      <div className="font-mono text-slate-500">{a.bastNo} ({a.handoverDate})</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">Rp {a.value.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(a.geotagCoord)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded font-mono border border-slate-200"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{a.location}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded font-semibold border ${
                          a.condition === 'Baik'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {a.condition}
                      </span>
                      <div className="text-slate-500 mt-1">Jadwal: {a.maintenanceSchedule}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailAssetId(a.id)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar totalItems={programAssets.length} currentPage={asetPage} pageSize={asetPageSize} onPageChange={setAsetPage} onPageSizeChange={setAsetPageSize} />
        </div>
      )}

      {/* TAB 4: RISK REGISTER & ANTI-FRAUD */}
      {activeTab === 'risiko' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900">Risk Register, Conflict of Interest & Red Flag Anti-Fraud (COSO ERM / ISO 37001)</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Kode & Program</th>
                  <th className="py-3 px-4">Kategori & Uraian Risiko</th>
                  <th className="py-3 px-4 text-center">Level</th>
                  <th className="py-3 px-4">Rencana Mitigasi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {risks.slice((riskPage - 1) * riskPageSize, riskPage * riskPageSize).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setDetailRiskId(r.id)}
                        className="font-mono font-bold text-sky-800 hover:underline text-left block"
                      >
                        {r.code}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailRiskId(r.id)}
                        className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                      >
                        {r.programName}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{r.category}</div>
                      <p className="text-slate-600">{r.description}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded font-bold border ${
                          r.level === 'Tinggi'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : r.level === 'Menengah'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {r.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{r.mitigation}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.status}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailRiskId(r.id)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar totalItems={risks.length} currentPage={riskPage} pageSize={riskPageSize} onPageChange={setRiskPage} onPageSizeChange={setRiskPageSize} />
        </div>
      )}

      {/* Modal: Detail Penerima Manfaat (SBR) */}
      <Modal
        isOpen={Boolean(detailSbr)}
        onClose={() => setDetailSbrNik(null)}
        title={`Detail Penerima Manfaat (SBR) — ${detailSbr ? maskNik(detailSbr.nik, userRole) : ''}`}
        maxWidth="max-w-3xl"
        footer={
          detailSbr && (
            <>
              <button
                onClick={() => setDetailSbrNik(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Tutup
              </button>
              {policy.canToggleSbrBlacklist && (
                <button
                  onClick={() => toggleSbrBlacklist(detailSbr.nik)}
                  className={`px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-1.5 ${
                    detailSbr.isBlacklisted
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-rose-700 hover:bg-rose-800 text-white'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  <span>{detailSbr.isBlacklisted ? 'Pulihkan dari Blacklist' : 'Masukkan ke Blacklist'}</span>
                </button>
              )}
            </>
          )
        }
      >
        {detailSbr && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                NIK: {maskNik(detailSbr.nik, userRole)} 
              </span>
              {detailSbr.npwpOrNib && (
                <span className="font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                  {detailSbr.npwpOrNib}
                </span>
              )}
              {detailSbr.ring && (
                <span className="font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                  {detailSbr.ring}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-semibold border ${
                  detailSbr.isBlacklisted
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{detailSbr.isBlacklisted ? 'BLACKLIST AKTIF' : 'Valid Dukcapil e-KYC'}</span>
              </span>
              <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                Graduasi: {detailSbr.graduationStatus}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-base font-bold text-slate-900">{detailSbr.name}</div>
              <div className="text-slate-700">{detailSbr.address}</div>
              {detailSbr.isBlacklisted && detailSbr.blacklistReason && (
                <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                  <strong>Catatan Blacklist:</strong> {detailSbr.blacklistReason}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Riwayat Bantuan Lintas Program ({detailSbr.programHistory.length} Riwayat)</span>
                </span>
                <span className="font-bold text-sky-800">
                  Total Akumulasi: Rp {detailSbr.programHistory.reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Tahun</th>
                      <th className="py-2.5 px-3">Nama Program</th>
                      <th className="py-2.5 px-3">Jenis</th>
                      <th className="py-2.5 px-3">Nilai</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailSbr.programHistory.map((hist, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{hist.year}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{hist.programName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{hist.type}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Rp {hist.amount.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">{hist.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Detail Mitra Pelaksana */}
      <Modal
        isOpen={Boolean(detailPartner)}
        onClose={() => setDetailPartnerId(null)}
        title={`Detail Mitra Pelaksana / Vendor — ${detailPartner?.code || ''}`}
        maxWidth="max-w-2xl"
        footer={
          detailPartner && (
            <>
              <button
                onClick={() => setDetailPartnerId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Tutup
              </button>
              {policy.canTogglePartnerBlacklist && (
                <button
                  onClick={() => togglePartnerBlacklist(detailPartner.id)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    detailPartner.isBlacklisted
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-rose-700 hover:bg-rose-800 text-white'
                  }`}
                >
                  {detailPartner.isBlacklisted ? 'Cabut Status Blacklist' : 'Masukkan ke Daftar Blacklist'}
                </button>
              )}
            </>
          )
        }
      >
        {detailPartner && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {detailPartner.code}
              </span>
              <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                {detailPartner.type}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  detailPartner.isBlacklisted
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {detailPartner.isBlacklisted ? 'Blacklist Aktif' : detailPartner.dueDiligenceStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-semibold block">Nama Mitra / Lembaga:</span>
                <div className="text-base font-bold text-slate-900">{detailPartner.name}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nomor Legalitas (AHU / NIB / Akta):</span>
                <div className="font-mono font-semibold text-slate-800">{detailPartner.legalityNo}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Kontrak SPK / PKS Aktif:</span>
                <div className="font-bold text-slate-900">{detailPartner.activeContracts} Kontrak Berjalan</div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-semibold block">Skor Evaluasi Kinerja Mitra:</span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${detailPartner.performanceScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, detailPartner.performanceScore)}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-900">{detailPartner.performanceScore} / 100</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Detail Aset Hasil Program */}
      <Modal
        isOpen={Boolean(detailAsset)}
        onClose={() => setDetailAssetId(null)}
        title={`Detail Aset Hasil Program — ${detailAsset?.assetCode || ''}`}
        maxWidth="max-w-2xl"
        footer={
          <button
            onClick={() => setDetailAssetId(null)}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
          >
            Tutup
          </button>
        }
      >
        {detailAsset && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {detailAsset.assetCode}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  detailAsset.condition === 'Baik'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                Kondisi: {detailAsset.condition}
              </span>
              <span className="font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                {detailAsset.bastNo}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-semibold block">Nama Aset & Program Asal:</span>
                <div className="text-base font-bold text-slate-900">{detailAsset.assetName}</div>
                <div className="text-slate-600 mt-0.5">Program: {detailAsset.programTitle}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Penerima Serah Terima (BAST):</span>
                <div className="font-semibold text-slate-900">{detailAsset.recipientCommunity}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Tanggal Serah Terima & Nilai:</span>
                <div className="font-bold text-sky-900">Rp {detailAsset.value.toLocaleString('id-ID')}</div>
                <div className="text-slate-600">Tanggal BAST: {detailAsset.handoverDate}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Lokasi & Geotag Aset:</span>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(detailAsset.geotagCoord)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded font-mono border border-slate-200"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{detailAsset.location} ({detailAsset.geotagCoord})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Jadwal Pemeliharaan Berkala:</span>
                <div className="font-semibold text-slate-800">{detailAsset.maintenanceSchedule}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Detail Risk Register */}
      <Modal
        isOpen={Boolean(detailRisk)}
        onClose={() => setDetailRiskId(null)}
        title={`Detail Risiko & Mitigasi — ${detailRisk?.code || ''}`}
        maxWidth="max-w-2xl"
        footer={
          <button
            onClick={() => setDetailRiskId(null)}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
          >
            Tutup
          </button>
        }
      >
        {detailRisk && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {detailRisk.code}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Kategori: {detailRisk.category}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-bold border ${
                  detailRisk.level === 'Tinggi'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : detailRisk.level === 'Menengah'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                Level Risiko: {detailRisk.level}
              </span>
              <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
                Status: {detailRisk.status}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block">Program Terkait:</span>
              <div className="text-base font-bold text-slate-900">{detailRisk.programName}</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Uraian Risiko / Red Flag:</div>
              <p className="text-slate-700 leading-relaxed">{detailRisk.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <div className="font-bold mb-1">Rencana Mitigasi & Pengendalian (COSO ERM / ISO 37001):</div>
              <p className="leading-relaxed">{detailRisk.mitigation}</p>
            </div>
          </div>
        )}
      </Modal>

      <ImportDataModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        defaultType={importType}
      />
    </div>
  );
};
