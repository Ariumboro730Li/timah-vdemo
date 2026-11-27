import React, { useState, useEffect } from 'react';
import { CharityItem } from '../../types';
import {
  Plus,
  Camera,
  CheckCircle2,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Zap,
  QrCode,
  ShieldCheck,
  Eye,
  Lock,
  Search,
  X
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { PaginationBar } from '../common/PaginationBar';
import { useAppState } from '../../context/AppStateContext';
import { getRolePolicy, getCharityActionPermission, maskNik, maskAccountNo } from '../../utils/rbac';

export const ImplementasiView: React.FC = () => {
  const {
    userRole,
    activeJourney,
    projects,
    charities,
    advanceProjectProgress,
    completeProjectBast,
    addCharityItem,
    advanceCharityStatus
  } = useAppState();
  const policy = getRolePolicy(userRole);
  const isRkapJourney = activeJourney === 'rkap';

  const [activeTab, setActiveTab] = useState<'ppm' | 'charity'>('ppm');

  useEffect(() => {
    if (isRkapJourney && activeTab !== 'ppm') {
      setActiveTab('ppm');
    }
  }, [isRkapJourney, activeTab]);
  const [ppmPage, setPpmPage] = useState(1);
  const [ppmPageSize, setPpmPageSize] = useState(5);
  const [ppmStatusFilter, setPpmStatusFilter] = useState<'all' | 'berjalan' | 'review' | 'selesai'>('all');
  const [ppmSearch, setPpmSearch] = useState('');
  const [chPage, setChPage] = useState(1);
  const [chPageSize, setChPageSize] = useState(5);
  const [charityCatFilter, setCharityCatFilter] = useState<'Semua' | CharityItem['category']>('Semua');
  const [charityStatusFilter, setCharityStatusFilter] = useState<'Semua' | CharityItem['disbursementStatus']>('Semua');
  const [charitySearch, setCharitySearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [isAddCharityOpen, setIsAddCharityOpen] = useState(false);

  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) || null : null;
  const selectedCharity = selectedCharityId ? charities.find((c) => c.id === selectedCharityId) || null : null;

  // Charity form state
  const [chApplicant, setChApplicant] = useState('');
  const [chNik, setChNik] = useState('');
  const [chAccount, setChAccount] = useState('');
  const [chCategory, setChCategory] = useState<CharityItem['category']>('Bencana');
  const [chFastTrack, setChFastTrack] = useState(false);
  const [chAmount, setChAmount] = useState(15000000);
  const [chLocation, setChLocation] = useState('Muntok, Bangka Barat');
  const [chCoi, setChCoi] = useState(true);

  const subLimits: Record<CharityItem['category'], number> = {
    Bencana: 500000000,
    Keagamaan: 300000000,
    Pendidikan: 350000000,
    Kesehatan: 300000000,
    'Sarana Umum': 400000000
  };

  const handleCreateCharity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chApplicant.trim() || chNik.replace(/\D/g, '').length !== 16) return;
    addCharityItem({
      applicant: chApplicant.trim(),
      nik: chNik.replace(/\D/g, ''),
      accountNo: chAccount.trim() || 'Rekening Terverifikasi (H2H)',
      category: chCategory,
      isFastTrack: chFastTrack,
      requestedAmount: Number(chAmount),
      location: chLocation,
      geotagCoord: '-2.0642, 105.1614',
      conflictOfInterestDeclared: chCoi
    });
    setChApplicant('');
    setChNik('');
    setChAccount('');
    setIsAddCharityOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Tabs & Primary CTA */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ppm')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'ppm' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Program PPM & Kontrak SPK ({projects.length})
          </button>
          {!isRkapJourney && (
            <button
              onClick={() => setActiveTab('charity')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'charity' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Bantuan TJSL / Charity & Darurat ({charities.length})
            </button>
          )}
        </div>

        {!isRkapJourney && policy.canCreateCharity && (
          <button
            onClick={() => {
              setActiveTab('charity');
              setIsAddCharityOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Input Bantuan Charity / Darurat</span>
          </button>
        )}
      </div>

      {/* TAB 1: PROGRAM PPM */}
      {activeTab === 'ppm' && (() => {
        const isSelesai = (p: (typeof projects)[number]) => p.bastSigned && p.lpjStatus === 'Terverifikasi';
        const isReview = (p: (typeof projects)[number]) =>
          !isSelesai(p) && (p.lpjStatus === 'Review' || p.progressPercent >= 100);
        const isBerjalan = (p: (typeof projects)[number]) => !isSelesai(p) && !isReview(p);

        const countAll = projects.length;
        const countBerjalan = projects.filter(isBerjalan).length;
        const countReview = projects.filter(isReview).length;
        const countSelesai = projects.filter(isSelesai).length;

        const q = ppmSearch.trim().toLowerCase();
        const filteredProjects = projects.filter((prj) => {
          const matchStatus =
            ppmStatusFilter === 'all'
              ? true
              : ppmStatusFilter === 'berjalan'
              ? isBerjalan(prj)
              : ppmStatusFilter === 'review'
              ? isReview(prj)
              : isSelesai(prj);
          if (!matchStatus) return false;
          if (!q) return true;
          return (
            prj.title.toLowerCase().includes(q) ||
            prj.spkNo.toLowerCase().includes(q) ||
            prj.partner.toLowerCase().includes(q) ||
            prj.location.toLowerCase().includes(q) ||
            prj.sapPoNo.toLowerCase().includes(q) ||
            prj.sapStatus.toLowerCase().includes(q) ||
            prj.lpjStatus.toLowerCase().includes(q) ||
            (prj.sourceProposalTicket || '').toLowerCase().includes(q) ||
            (prj.sourceRkapCode || '').toLowerCase().includes(q)
          );
        });

        const ppmStatusLabelMap: Record<'all' | 'berjalan' | 'review' | 'selesai', string> = {
          all: 'Semua Proyek PPM',
          berjalan: 'Sedang Berjalan (LPJ Belum)',
          review: 'Review LPJ / Siap BAST',
          selesai: 'Selesai (LPJ & BAST)'
        };

        const ppmCards: {
          id: 'all' | 'berjalan' | 'review' | 'selesai';
          label: string;
          count: number;
          sub: string;
          ringClass: string;
          textClass: string;
        }[] = [
          {
            id: 'all',
            label: 'Total Proyek SPK PPM',
            count: countAll,
            sub: 'Klik untuk tampilkan semua',
            ringClass: 'border-sky-500 ring-2 ring-sky-200 bg-sky-50/70',
            textClass: 'text-slate-900'
          },
          {
            id: 'berjalan',
            label: 'Sedang Berjalan (LPJ Belum)',
            count: countBerjalan,
            sub: 'Pelaksanaan fisik & termin SAP',
            ringClass: 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/70',
            textClass: 'text-amber-700'
          },
          {
            id: 'review',
            label: 'Review LPJ / Siap BAST',
            count: countReview,
            sub: 'Menunggu verifikasi LPJ & BAST',
            ringClass: 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/70',
            textClass: 'text-indigo-700'
          },
          {
            id: 'selesai',
            label: 'Selesai (LPJ & BAST)',
            count: countSelesai,
            sub: 'Tuntas 100% & tercatat di Aset',
            ringClass: 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/70',
            textClass: 'text-emerald-700'
          }
        ];

        return (
        <div className="space-y-4">
          {/* Interactive Status Cards synced to PPM Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ppmCards.map((card) => {
              const active = ppmStatusFilter === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setPpmStatusFilter((curr) => (curr === card.id && card.id !== 'all' ? 'all' : card.id));
                    setPpmPage(1);
                  }}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    active
                      ? card.ringClass
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-600">{card.label}</span>
                    {active && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold text-sm">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className={`text-2xl font-bold mt-1.5 ${card.textClass}`}>{card.count}</div>
                  <div className="text-slate-500 mt-1">{card.sub}</div>
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">Pelaksanaan Program Pemberdayaan Masyarakat (PPM)</h3>
                  {(ppmStatusFilter !== 'all' || ppmSearch.trim() !== '') && (
                    <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-900 font-semibold">
                      <span>
                        {ppmStatusLabelMap[ppmStatusFilter]} ({filteredProjects.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPpmStatusFilter('all');
                          setPpmSearch('');
                          setPpmPage(1);
                        }}
                        className="text-sky-700 hover:text-rose-700 font-bold underline"
                      >
                        Reset
                      </button>
                    </span>
                  )}
                </div>
                <p className="text-slate-500">
                  Terhubung dengan RKAP, Seleksi Proposal, SAP FICO, Absensi QR Lapangan, Geotag, dan otomatis mendaftarkan Aset saat BAST selesai.
                </p>
              </div>

              {/* Search Input synced to PPM Table */}
              <div className="relative w-full lg:w-80 flex-shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ppmSearch}
                  onChange={(e) => {
                    setPpmSearch(e.target.value);
                    setPpmPage(1);
                  }}
                  placeholder="Cari SPK, kegiatan, mitra, PO, tiket..."
                  className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm bg-slate-50 focus:bg-white transition-all"
                />
                {ppmSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setPpmSearch('');
                      setPpmPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    title="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-3 px-4">SPK & Kegiatan</th>
                    <th className="py-3 px-4">Mitra & Lokasi Geotag</th>
                    <th className="py-3 px-4">Nilai & Realisasi</th>
                    <th className="py-3 px-4">Integrasi SAP FICO</th>
                    <th className="py-3 px-4">Bukti Lapangan</th>
                    <th className="py-3 px-4 text-center">RAG / LPJ</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 px-4 text-center text-slate-500">
                        <div className="font-semibold text-slate-700">
                          Tidak ada proyek PPM yang cocok dengan filter atau pencarian saat ini.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPpmStatusFilter('all');
                            setPpmSearch('');
                            setPpmPage(1);
                          }}
                          className="mt-3 px-4 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                        >
                          Tampilkan Semua Proyek ({projects.length})
                        </button>
                      </td>
                    </tr>
                  ) : (
                  filteredProjects.slice((ppmPage - 1) * ppmPageSize, ppmPage * ppmPageSize).map((prj) => (
                    <tr key={prj.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedProjectId(prj.id)}
                          className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                        >
                          {prj.title}
                        </button>
                        <div className="font-mono text-sky-800">{prj.spkNo}</div>
                        {(prj.sourceRkapCode || prj.sourceProposalTicket) && (
                          <div className="text-slate-500">
                            Sumber: {prj.sourceRkapCode || prj.sourceProposalTicket}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{prj.partner}</div>
                        <a
                          href={`https://www.google.com/maps?q=${encodeURIComponent(prj.geotagCoord)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded font-mono border border-slate-200"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{prj.location}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          Rp {(prj.contractValue / 1000000).toLocaleString('id-ID')} Jt
                        </div>
                        <div className="text-emerald-700">
                          Cair: Rp {(prj.realizedValue / 1000000).toLocaleString('id-ID')} Jt ({prj.progressPercent}%)
                        </div>
                        <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full" style={{ width: `${prj.progressPercent}%` }}></div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-700">PO: {prj.sapPoNo}</div>
                        <span
                          className={`inline-block mt-0.5 font-semibold px-2 py-0.5 rounded ${
                            prj.sapStatus === 'Posted' || prj.sapStatus === 'Settled'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {prj.sapStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Camera className="w-4 h-4 text-sky-600" />
                          <span>{prj.geotagPhotos} Foto Geotag</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                          <QrCode className="w-4 h-4 text-slate-400" />
                          <span>{prj.qrAttendanceCount} Absensi QR</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold ${
                            prj.ragStatus === 'Hijau'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prj.ragStatus === 'Kuning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {prj.ragStatus}
                        </span>
                        <div className="text-slate-500 mt-1">LPJ: {prj.lpjStatus}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedProjectId(prj.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationBar
              totalItems={filteredProjects.length}
              currentPage={ppmPage}
              pageSize={ppmPageSize}
              onPageChange={setPpmPage}
              onPageSizeChange={setPpmPageSize}
            />
          </div>
        </div>
        );
      })()}

      {/* TAB 2: BANTUAN CHARITY / SOSIAL KEMASYARAKATAN */}
      {activeTab === 'charity' && (() => {
        const chQ = charitySearch.trim().toLowerCase();
        const filteredCharities = charities.filter((c) => {
          if (charityCatFilter !== 'Semua' && c.category !== charityCatFilter) return false;
          if (charityStatusFilter !== 'Semua' && c.disbursementStatus !== charityStatusFilter) return false;
          if (!chQ) return true;
          return (
            c.ticketNo.toLowerCase().includes(chQ) ||
            c.applicant.toLowerCase().includes(chQ) ||
            c.nik.toLowerCase().includes(chQ) ||
            c.category.toLowerCase().includes(chQ) ||
            c.location.toLowerCase().includes(chQ) ||
            c.disbursementStatus.toLowerCase().includes(chQ) ||
            c.approverLevel.toLowerCase().includes(chQ)
          );
        });

        const charityStatusCards: {
          status: 'Semua' | CharityItem['disbursementStatus'];
          label: string;
          count: number;
          ringClass: string;
          textClass: string;
        }[] = [
          {
            status: 'Semua',
            label: 'Total Tiket Charity',
            count: charities.length,
            ringClass: 'border-sky-500 ring-2 ring-sky-200 bg-sky-50/70',
            textClass: 'text-slate-900'
          },
          {
            status: 'Verifikasi',
            label: 'Verifikasi Berkas',
            count: charities.filter((c) => c.disbursementStatus === 'Verifikasi').length,
            ringClass: 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/70',
            textClass: 'text-amber-700'
          },
          {
            status: 'Menunggu Persetujuan',
            label: 'Menunggu Persetujuan',
            count: charities.filter((c) => c.disbursementStatus === 'Menunggu Persetujuan').length,
            ringClass: 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/70',
            textClass: 'text-indigo-700'
          },
          {
            status: 'Cair ke Penerima',
            label: 'Cair · Menunggu BAST',
            count: charities.filter((c) => c.disbursementStatus === 'Cair ke Penerima').length,
            ringClass: 'border-cyan-500 ring-2 ring-cyan-200 bg-cyan-50/70',
            textClass: 'text-sky-700'
          },
          {
            status: 'BAST Selesai',
            label: 'BAST Selesai',
            count: charities.filter((c) => c.disbursementStatus === 'BAST Selesai').length,
            ringClass: 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/70',
            textClass: 'text-emerald-700'
          }
        ];

        return (
        <div className="space-y-4">
          {/* Interactive Status Cards synced to Charity Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {charityStatusCards.map((sc) => {
              const active = charityStatusFilter === sc.status;
              return (
                <button
                  key={sc.status}
                  type="button"
                  onClick={() => {
                    setCharityStatusFilter((curr) => (curr === sc.status && sc.status !== 'Semua' ? 'Semua' : sc.status));
                    setChPage(1);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    active
                      ? sc.ringClass
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-600">{sc.label}</span>
                    {active && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold text-sm">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${sc.textClass}`}>{sc.count}</div>
                </button>
              );
            })}
          </div>

          {/* Sub-limit Pagu per Kategori (C-03) — Interactive Filter Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-bold text-slate-900">Kontrol Sub-Limit Anggaran Bantuan Charity per Kategori (Klik untuk Filter)</h3>
              {charityCatFilter !== 'Semua' && (
                <button
                  type="button"
                  onClick={() => {
                    setCharityCatFilter('Semua');
                    setChPage(1);
                  }}
                  className="px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-semibold hover:bg-sky-100"
                >
                  Tampilkan Semua Kategori ({charities.length})
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(Object.keys(subLimits) as CharityItem['category'][]).map((cat) => {
                const catItems = charities.filter((c) => c.category === cat);
                const used = catItems.reduce((a, b) => a + b.requestedAmount, 0);
                const pct = Math.min(100, Math.round((used / subLimits[cat]) * 100));
                const isSelected = charityCatFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCharityCatFilter((curr) => (curr === cat ? 'Semua' : cat));
                      setChPage(1);
                    }}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-800">{cat}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">
                        {catItems.length}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Rp {(used / 1000000).toFixed(1)} Jt / Rp {subLimits[cat] / 1000000} Jt
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-sky-600 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Charity Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">Penyaluran Bantuan TJSL / Charity & Jalur Darurat (SOP 11.2)</h3>
                  {(charityCatFilter !== 'Semua' || charityStatusFilter !== 'Semua' || charitySearch.trim() !== '') && (
                    <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-900 font-semibold">
                      <span>Hasil Filter: {filteredCharities.length} tiket</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCharityCatFilter('Semua');
                          setCharityStatusFilter('Semua');
                          setCharitySearch('');
                          setChPage(1);
                        }}
                        className="text-sky-700 hover:text-rose-700 font-bold underline"
                      >
                        Reset
                      </button>
                    </span>
                  )}
                </div>
                <p className="text-slate-500">Dilengkapi deteksi fraud/anomali, deklarasi bebas benturan kepentingan (COI), dan pencairan langsung (direct to beneficiary)</p>
              </div>

              {/* Search Input synced to Charity Table */}
              <div className="relative w-full lg:w-80 flex-shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={charitySearch}
                  onChange={(e) => {
                    setCharitySearch(e.target.value);
                    setChPage(1);
                  }}
                  placeholder="Cari tiket, penerima, lokasi, status..."
                  className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm bg-slate-50 focus:bg-white transition-all"
                />
                {charitySearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setCharitySearch('');
                      setChPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    title="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Tiket & Jalur</th>
                    <th className="py-3 px-4">Penerima & Rekening</th>
                    <th className="py-3 px-4">Kategori & Lokasi</th>
                    <th className="py-3 px-4">Nominal & Penyetuju</th>
                    <th className="py-3 px-4">Kontrol Fraud & COI</th>
                    <th className="py-3 px-4">Status Penyaluran</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCharities.slice((chPage - 1) * chPageSize, chPage * chPageSize).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCharityId(c.id)}
                          className="font-mono font-bold text-sky-800 hover:underline text-left block"
                        >
                          {c.ticketNo}
                        </button>
                        {c.isFastTrack ? (
                          <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                            <Zap className="w-3.5 h-3.5" /> Fast-Track 24 Jam
                          </span>
                        ) : (
                          <span className="text-slate-500">Reguler</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCharityId(c.id)}
                          className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                        >
                          {c.applicant}
                        </button>
                        <div className="font-mono text-slate-500">NIK: {maskNik(c.nik, userRole)}</div>
                        <div className="text-slate-600">{maskAccountNo(c.accountNo, userRole)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{c.category}</div>
                        <a
                          href={`https://www.google.com/maps?q=${encodeURIComponent(c.geotagCoord)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded font-mono border border-slate-200"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{c.location}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">Rp {c.requestedAmount.toLocaleString('id-ID')}</div>
                        <div className="text-sky-700 font-medium">Approval: {c.approverLevel}</div>
                      </td>
                      <td className="py-3 px-4">
                        {c.fraudFlags.length === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            <ShieldCheck className="w-4 h-4" /> Bersih & COI Sah
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {c.fraudFlags.map((fl, i) => (
                              <div key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{fl}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold border ${
                            c.disbursementStatus === 'BAST Selesai'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : c.disbursementStatus === 'Cair ke Penerima'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {c.disbursementStatus}
                        </span>
                        {c.bastNo && <div className="font-mono text-slate-500 mt-0.5">{c.bastNo}</div>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCharityId(c.id)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Detail</span>
                          </button>
                          {c.disbursementStatus !== 'BAST Selesai' ? (() => {
                            const perm = getCharityActionPermission(userRole, c);
                            return perm.allowed ? (
                              <button
                                onClick={() => advanceCharityStatus(c.id)}
                                className="px-3 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                              >
                                {perm.actionLabel}
                              </button>
                            ) : (
                              <span
                                title={`Tahap ini memerlukan ${perm.lockedReason}`}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold inline-flex items-center gap-1"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>{perm.lockedReason}</span>
                              </span>
                            );
                          })() : (
                            <span className="text-emerald-700 font-semibold">✓ Selesai & Arsip</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              totalItems={filteredCharities.length}
              currentPage={chPage}
              pageSize={chPageSize}
              onPageChange={setChPage}
              onPageSizeChange={setChPageSize}
            />
          </div>
        </div>
        );
      })()}

      {/* Modal: Detail & Verifikasi Proyek PPM */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProjectId(null)}
        title={`Detail Proyek Implementasi PPM — ${selectedProject?.spkNo || ''}`}
        maxWidth="max-w-3xl"
        footer={
          selectedProject && (
            <>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Tutup
              </button>
              {policy.canManagePpm && selectedProject.progressPercent < 100 && (
                <button
                  onClick={() => advanceProjectProgress(selectedProject.id)}
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                >
                  Verifikasi Output & Posting Termin SAP
                </button>
              )}
              {policy.canManagePpm && !selectedProject.bastSigned && (
                <button
                  onClick={() => completeProjectBast(selectedProject.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tutup LPJ, BAST & Catat Aset</span>
                </button>
              )}
              {!policy.canManagePpm && (
                <span className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-semibold inline-flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Mode Pantau (Read-Only)</span>
                </span>
              )}
            </>
          )
        }
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {selectedProject.spkNo}
              </span>
              <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                Pilar {selectedProject.pillar}
              </span>
              <span
                className={`font-semibold px-2.5 py-1 rounded border ${
                  selectedProject.ragStatus === 'Hijau'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedProject.ragStatus === 'Kuning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                RAG: {selectedProject.ragStatus}
              </span>
              <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                LPJ: {selectedProject.lpjStatus}
              </span>
              <span
                className={`font-semibold px-2.5 py-1 rounded border ${
                  selectedProject.bastSigned
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {selectedProject.bastSigned ? '✓ BAST Ditandatangani' : 'BAST Belum Selesai'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-semibold block">Nama Kegiatan & Sumber:</span>
                <div className="text-base font-bold text-slate-900">{selectedProject.title}</div>
                {(selectedProject.sourceRkapCode || selectedProject.sourceProposalTicket) && (
                  <div className="text-slate-600 mt-0.5">
                    Referensi Sumber: <span className="font-mono font-semibold">{selectedProject.sourceRkapCode || selectedProject.sourceProposalTicket}</span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Mitra Pelaksana:</span>
                <div className="font-semibold text-slate-900">{selectedProject.partner}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Lokasi & Geotag Lapangan:</span>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(selectedProject.geotagCoord)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded font-mono border border-slate-200"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{selectedProject.location} ({selectedProject.geotagCoord})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nilai Kontrak & Realisasi ({selectedProject.currentTerm}):</span>
                <div className="font-bold text-slate-900">
                  Rp {selectedProject.realizedValue.toLocaleString('id-ID')} / Rp {selectedProject.contractValue.toLocaleString('id-ID')}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-600 rounded-full" style={{ width: `${selectedProject.progressPercent}%` }} />
                  </div>
                  <span className="font-bold text-sky-800">{selectedProject.progressPercent}%</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Integrasi SAP FICO & Bukti Lapangan:</span>
                <div className="font-mono font-bold text-sky-800">
                  PO {selectedProject.sapPoNo} ({selectedProject.sapStatus})
                </div>
                <div className="text-slate-700 mt-0.5">
                  {selectedProject.geotagPhotos} Foto Geotag &bull; {selectedProject.qrAttendanceCount} Absensi QR &bull; {selectedProject.changeRequests} Adendum/CR
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-800 mb-2">Jadwal & Milestone Pelaksanaan:</div>
              <div className="space-y-2">
                {selectedProject.milestones.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <div className="text-slate-500">Target: {m.targetDate} &bull; Bobot {m.weightPercent}%</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded font-semibold ${
                        m.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.status === 'Berjalan'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
              <strong>Exit Strategy & Keberlanjutan:</strong> {selectedProject.exitStrategy}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Detail Bantuan Charity / Darurat */}
      <Modal
        isOpen={Boolean(selectedCharity)}
        onClose={() => setSelectedCharityId(null)}
        title={`Detail Bantuan TJSL / Charity — ${selectedCharity?.ticketNo || ''}`}
        maxWidth="max-w-3xl"
        footer={
          selectedCharity && (
            <>
              <button
                onClick={() => setSelectedCharityId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Tutup
              </button>
              {selectedCharity.disbursementStatus !== 'BAST Selesai' && (() => {
                const perm = getCharityActionPermission(userRole, selectedCharity);
                return perm.allowed ? (
                  <button
                    onClick={() => advanceCharityStatus(selectedCharity.id)}
                    className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                  >
                    {perm.actionLabel}
                  </button>
                ) : (
                  <span className="px-3.5 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold inline-flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Terkunci — {perm.lockedReason}</span>
                  </span>
                );
              })()}
            </>
          )
        }
      >
        {selectedCharity && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {selectedCharity.ticketNo}
              </span>
              {selectedCharity.isFastTrack ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                  <Zap className="w-4 h-4" /> Jalur Fast-Track Darurat 24 Jam
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  Jalur Reguler
                </span>
              )}
              <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
                {selectedCharity.category}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  selectedCharity.disbursementStatus === 'BAST Selesai'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedCharity.disbursementStatus === 'Cair ke Penerima'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {selectedCharity.disbursementStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-slate-500 font-semibold block">Nama Penerima / Lembaga:</span>
                <div className="text-base font-bold text-slate-900">{selectedCharity.applicant}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">
                  NIK Penanggung Jawab (SBR) {!policy.canViewUnmaskedPii && '• Masked UU PDP'}:
                </span>
                <div className="font-mono font-bold text-slate-800">{maskNik(selectedCharity.nik, userRole)}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">
                  Rekening Direct-to-Beneficiary {!policy.canViewUnmaskedPii && '• Masked'}:
                </span>
                <div className="font-semibold text-slate-800">{maskAccountNo(selectedCharity.accountNo, userRole)}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Tanggal Pengajuan & No BAST:</span>
                <div className="text-slate-800">
                  {selectedCharity.dateSubmitted} &bull; <span className="font-mono font-semibold">{selectedCharity.bastNo || 'BAST Belum Terbit'}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nominal & Matriks Approval:</span>
                <div className="text-lg font-bold text-sky-800">Rp {selectedCharity.requestedAmount.toLocaleString('id-ID')}</div>
                <div className="text-slate-600">Penyetuju: <strong>{selectedCharity.approverLevel}</strong></div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Lokasi & Geotag Penyaluran:</span>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(selectedCharity.geotagCoord)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded font-mono border border-slate-200"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{selectedCharity.location} ({selectedCharity.geotagCoord})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="font-bold text-slate-900">Kontrol Anti-Fraud & Benturan Kepentingan (COI):</div>
              <div className="text-slate-700">
                Deklarasi Bebas Benturan Kepentingan:{' '}
                <strong className={selectedCharity.conflictOfInterestDeclared ? 'text-emerald-700' : 'text-rose-700'}>
                  {selectedCharity.conflictOfInterestDeclared ? '✓ Terpenuhi & Ditandatangani' : '✗ Belum Deklarasi'}
                </strong>
              </div>
              {selectedCharity.fraudFlags.length === 0 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Tidak ditemukan indikasi red flag / anomali pencairan.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {selectedCharity.fraudFlags.map((fl, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{fl}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Input Bantuan Charity / Darurat */}
      <Modal
        isOpen={isAddCharityOpen}
        onClose={() => setIsAddCharityOpen(false)}
        title="Registrasi Bantuan TJSL / Charity & Jalur Darurat"
      >
        <form onSubmit={handleCreateCharity} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Penerima / Lembaga *</label>
              <input
                type="text"
                required
                value={chApplicant}
                onChange={(e) => setChApplicant(e.target.value)}
                placeholder="Contoh: Posko Tanggap Darurat Desa Batu Betumpang"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">NIK Penanggung Jawab (16 Digit) *</label>
              <input
                type="text"
                required
                maxLength={16}
                value={chNik}
                onChange={(e) => setChNik(e.target.value)}
                placeholder="1903011509850001"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kategori Bantuan</label>
              <select
                value={chCategory}
                onChange={(e) => setChCategory(e.target.value as CharityItem['category'])}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Bencana">Bencana / Kedaruratan</option>
                <option value="Keagamaan">Keagamaan</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Sarana Umum">Sarana Umum</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nominal Bantuan (Rp) *</label>
              <input
                type="number"
                required
                value={chAmount}
                onChange={(e) => setChAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Rekening Penerima / Vendor</label>
              <input
                type="text"
                value={chAccount}
                onChange={(e) => setChAccount(e.target.value)}
                placeholder="No Rekening Bank (Direct Transfer)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lokasi Penyaluran</label>
              <input
                type="text"
                value={chLocation}
                onChange={(e) => setChLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer">
              <input type="checkbox" checked={chFastTrack} onChange={(e) => setChFastTrack(e.target.checked)} className="w-4 h-4 accent-rose-600" />
              <span className="font-semibold text-rose-900">Aktifkan Jalur Fast-Track Darurat Bencana (SLA Verifikasi 24 Jam / Approval 12 Jam)</span>
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input type="checkbox" checked={chCoi} onChange={(e) => setChCoi(e.target.checked)} className="w-4 h-4 accent-sky-700" />
              <span className="font-medium text-slate-800">Deklarasi Bebas Benturan Kepentingan (Conflict of Interest Declaration) terpenuhi</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddCharityOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 font-semibold">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold">
              Simpan Tiket Bantuan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
