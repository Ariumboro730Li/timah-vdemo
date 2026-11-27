import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  RefreshCcw,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarRange,
  FileCheck2,
  Hammer,
  Award,
  Store,
  TrendingUp,
  Lock,
  MessageSquareWarning,
  ShoppingBag
} from 'lucide-react';
import { NavView, ProposalItem } from '../../types';
import { useAppState } from '../../context/AppStateContext';
import { isViewAllowed, maskNik } from '../../utils/rbac';

interface PortalFlowViewProps {
  onNavigate: (view: NavView) => void;
}

export const PortalFlowView: React.FC<PortalFlowViewProps> = ({ onNavigate }) => {
  const state = useAppState();
  const isPublic = state.userRole === 'pemohon';
  const [activeTab, setActiveTab] = useState<'flow' | 'submit' | 'track' | 'grievance' | 'catalog'>(
    isPublic ? 'submit' : 'flow'
  );

  // Grievance public form state
  const [grvProgram, setGrvProgram] = useState('Program Pemberdayaan Masyarakat Desa');
  const [grvLocation, setGrvLocation] = useState('Muntok, Bangka Barat');
  const [grvDesc, setGrvDesc] = useState('');
  const [grvSubmitted, setGrvSubmitted] = useState(false);

  useEffect(() => {
    if (isPublic && activeTab === 'flow') {
      setActiveTab('submit');
    }
  }, [isPublic, activeTab]);

  const handlePublicGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grvDesc.trim()) return;
    state.addMonevIssue({
      programTitle: grvProgram.trim(),
      location: grvLocation.trim(),
      category: 'Keluhan Warga (Grievance)',
      source: 'Grievance Masyarakat',
      description: grvDesc.trim(),
      pic: 'Tim Monev & Grievance CSR',
      deadline: '07 Des 2026',
      status: 'Dalam Investigasi',
      slaDaysRemaining: 7,
      geotagCoord: '-2.0642, 105.1614'
    });
    setGrvDesc('');
    setGrvSubmitted(true);
  };

  // Portal submission form state
  const [applicant, setApplicant] = useState('');
  const [nik, setNik] = useState('');
  const [legalityNo, setLegalityNo] = useState('');
  const [programType, setProgramType] = useState<ProposalItem['programType']>('Program PPM');
  const [channel, setChannel] = useState<ProposalItem['channel']>('Portal Web/Mobile');
  const [category, setCategory] = useState('Pemberdayaan Pertanian');
  const [requestedAmount, setRequestedAmount] = useState(50000000);
  const [location, setLocation] = useState('Muntok, Bangka Barat');
  const [ring, setRing] = useState<'Ring 1' | 'Ring 2' | 'Ring 3'>('Ring 1');
  const [lastCreatedTicket, setLastCreatedTicket] = useState<string>('');

  // Track & Trace state
  const [trackQuery, setTrackQuery] = useState('PROP-2026-104');

  const handlePortalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant.trim() || nik.replace(/\D/g, '').length !== 16) {
      state.showToast('Nama Pemohon wajib diisi dan NIK harus 16 digit.', 'warning');
      return;
    }
    const created = state.submitProposal({
      applicant: applicant.trim(),
      nik: nik.replace(/\D/g, ''),
      legalityNo: legalityNo.trim() || 'SK-DESA/2026',
      channel,
      programType,
      category,
      requestedAmount: Number(requestedAmount),
      location,
      ring,
      geotagCoord: '-2.0642, 105.1614'
    });
    setLastCreatedTicket(created.ticketNo);
    setTrackQuery(created.ticketNo);
    setApplicant('');
    setNik('');
    setLegalityNo('');
  };

  const trackedProposal = state.proposals.find(
    (p) =>
      p.ticketNo.toLowerCase() === trackQuery.trim().toLowerCase() ||
      p.nik === trackQuery.trim()
  );

  const flowStages: {
    id: NavView;
    title: string;
    subtitle: string;
    metric: string;
    icon: React.ReactNode;
    accent: string;
  }[] = [
    {
      id: 'perencanaan',
      title: 'Perencanaan & RKAP',
      subtitle: 'Social Mapping (BPS/Podes), Theory of Change, Prioritisasi & Approval RKAP',
      metric: `${state.rkapList.length} Program RKAP`,
      icon: <CalendarRange className="w-5 h-5" />,
      accent: 'border-sky-300 bg-sky-50 text-sky-900'
    },
    {
      id: 'seleksi',
      title: 'Seleksi & Scoring Proposal',
      subtitle: 'Intake, Screening SBR Deduplikasi, Rubrik Terbobot, Komite & Matriks Kewenangan',
      metric: `${state.proposals.length} Proposal Masuk`,
      icon: <FileCheck2 className="w-5 h-5" />,
      accent: 'border-indigo-300 bg-indigo-50 text-indigo-900'
    },
    {
      id: 'implementasi',
      title: 'Implementasi PPM & Charity',
      subtitle: 'SPK/MoU e-Sign, Fast-Track Bencana, Geotag Lapangan, Pencairan SAP & BAST',
      metric: `${state.projects.length} Proyek & ${state.charities.length} Charity`,
      icon: <Hammer className="w-5 h-5" />,
      accent: 'border-emerald-300 bg-emerald-50 text-emerald-900'
    },
    {
      id: 'flagship',
      title: 'Program Flagship & SROI',
      subtitle: 'Program Multi-Tahun, Benefit Impact, Kalkulator SROI, Graduasi & Storytelling',
      metric: `${state.flagships.length} Program Unggulan`,
      icon: <Award className="w-5 h-5" />,
      accent: 'border-amber-300 bg-amber-50 text-amber-900'
    },
    {
      id: 'pumk',
      title: 'Koperasi & Pendanaan PUMK',
      subtitle: 'Onboarding 5C + Credit Scoring, VA Angsuran, Kolektibilitas DPD & Koperasi',
      metric: `${state.pumkLoans.length} Pinjaman & ${state.cooperatives.length} Koperasi`,
      icon: <Store className="w-5 h-5" />,
      accent: 'border-teal-300 bg-teal-50 text-teal-900'
    },
    {
      id: 'monev',
      title: 'Monitoring, Evaluasi & Closed-Loop',
      subtitle: 'KPI Library, Monev Geotag, Grievance SLA, OECD-DAC & Umpan Balik ke Perencanaan',
      metric: `${state.monevIssues.length} Tiket & ${state.lessonsLearned.length} Lessons`,
      icon: <TrendingUp className="w-5 h-5" />,
      accent: 'border-violet-300 bg-violet-50 text-violet-900'
    }
  ];

  const getTrackSteps = (p: ProposalItem) => [
    { label: 'Registrasi Proposal & Validasi Berkas', done: true, detail: `Tercatat ${p.dateSubmitted} via ${p.channel}` },
    { label: 'Screening Administratif & Deduplikasi SBR', done: p.adminScreeningStatus === 'Lolos', failed: p.adminScreeningStatus === 'Gugur', detail: `Status SBR: ${p.sbrStatus} (Kemiripan NLP: ${p.nlpSimilarityPercent}%)` },
    { label: 'Scoring Kuantitatif Multi-Reviewer', done: p.reviewerScores.length > 0, detail: p.score !== undefined ? `Skor terkalibrasi: ${p.score} / 100 (${p.recommendation})` : 'Menunggu penilaian reviewer' },
    { label: 'Forum Komite & Persetujuan Matriks Kewenangan', done: p.approvalStatus === 'Disetujui', failed: p.approvalStatus === 'Ditolak', detail: `Komite: ${p.committeeDecision} • Approval: ${p.approvalStatus}` },
    { label: 'Konversi ke Implementasi SPK / Pencairan Charity', done: Boolean(p.convertedToImpl), detail: p.convertedToImpl ? 'Aktif berjalan di Modul Implementasi & tercatat di SBR' : 'Menunggu penerbitan SPK / pencairan' }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex flex-wrap gap-2">
        {!isPublic && (
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'flow' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Alur Bisnis End-to-End (Closed-Loop)
          </button>
        )}
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'submit' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Portal Pengajuan Online (Pemohon / Mitra)
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'track' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pelacakan Status Real-Time (Track & Trace)
        </button>
        <button
          onClick={() => {
            setActiveTab('grievance');
            setGrvSubmitted(false);
          }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 ${
            activeTab === 'grievance' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4" />
          <span>Kanal Pengaduan (Grievance)</span>
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 ${
            activeTab === 'catalog' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>E-Katalog UMK Binaan</span>
        </button>
      </div>

      {/* TAB 1: CLOSED LOOP BUSINESS FLOW (Internal Only) */}
      {!isPublic && activeTab === 'flow' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Siklus Bisnis Terintegrasi CSR / TJSL / PPM / PUMK</h2>
            <p className="text-slate-600 mt-1">
              Seluruh modul terhubung secara fungsional: program RKAP dapat diturunkan langsung ke Implementasi, proposal yang disetujui otomatis membentuk SPK/Charity & tercatat di SBR, serta hasil evaluasi Monev (Lessons Learned) mengalir kembali menjadi masukan Perencanaan tahun berikutnya (<em>Closed-Loop Learning</em>).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
              {flowStages.map((stage) => {
                const allowed = isViewAllowed(state.userRole, stage.id);
                return (
                  <button
                    key={stage.id}
                    type="button"
                    disabled={!allowed}
                    onClick={() => allowed && onNavigate(stage.id)}
                    className={`text-left p-5 rounded-xl border-2 transition-all flex flex-col justify-between gap-3 ${
                      allowed
                        ? `${stage.accent} hover:shadow-md cursor-pointer`
                        : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-lg bg-white/80 shadow-2xs">{stage.icon}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white font-bold shadow-2xs text-slate-700">{stage.metric}</span>
                      </div>
                      <h3 className="text-base font-bold">{stage.title}</h3>
                      <p className="mt-1 opacity-90">{stage.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold pt-2 border-t border-black/10">
                      {allowed ? (
                        <>
                          <span>Masuk ke Modul</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Terkunci (Di luar kewenangan peran aktif)</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 p-4 rounded-xl bg-slate-900 text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <RefreshCcw className="w-6 h-6 text-sky-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-white">Closed-Loop Learning & Data Governance</div>
                  <div className="text-slate-300">
                    Rekomendasi evaluasi OECD-DAC dari Monev terhubung kembali ke Modul Perencanaan, didukung Single Beneficiary Registry (SBR), Import Data Tervalidasi, dan Audit Trail menyeluruh.
                  </div>
                </div>
              </div>
              {isViewAllowed(state.userRole, 'import') && (
                <button
                  onClick={() => onNavigate('import')}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex-shrink-0"
                >
                  Buka Pusat Import Data
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PORTAL PENGAJUAN */}
      {activeTab === 'submit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Portal Pengajuan Proposal & Bantuan Online</h2>
          <p className="text-slate-600 mt-1 mb-5">
            Usulan yang dikirimkan di sini otomatis melalui verifikasi deduplikasi NIK pada Single Beneficiary Registry (SBR) dan langsung masuk ke antrean Modul Seleksi Proposal.
          </p>

          {lastCreatedTicket && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-emerald-900">
                <strong>Pengajuan Teregistrasi!</strong> Nomor Tiket Anda:{' '}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {lastCreatedTicket}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('track')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Lacak Status Tiket
                </button>
                {isViewAllowed(state.userRole, 'seleksi') && (
                  <button
                    onClick={() => onNavigate('seleksi')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-semibold"
                  >
                    Proses di Seleksi Proposal &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handlePortalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Nama Pemohon / Kelompok / Lembaga *</label>
                <input
                  type="text"
                  required
                  value={applicant}
                  onChange={(e) => setApplicant(e.target.value)}
                  placeholder="Contoh: Kelompok Nelayan Pesisir Belinyu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">NIK Penanggung Jawab (16 Digit — Cek SBR) *</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Contoh: 1901051408860099 (Coba 1901026607810004 utk uji duplikasi)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Nomor Legalitas (AHU / NIB / SK Desa)</label>
                <input
                  type="text"
                  value={legalityNo}
                  onChange={(e) => setLegalityNo(e.target.value)}
                  placeholder="Contoh: SK-KADES/022/2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Kanal Permohonan</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as ProposalItem['channel'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-sky-500"
                >
                  <option value="Portal Web/Mobile">Portal Web / Mobile</option>
                  <option value="Aplikasi TEO">Aplikasi Eksisting (TEO)</option>
                  <option value="Surat OCR">Surat Masuk (Scan OCR)</option>
                  <option value="Fast-Track Darurat">Bencana / Kedaruratan (Fast-Track)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Jenis Program</label>
                <select
                  value={programType}
                  onChange={(e) => setProgramType(e.target.value as ProposalItem['programType'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-sky-500"
                >
                  <option value="Program PPM">Program PPM (Pemberdayaan Masyarakat)</option>
                  <option value="Bantuan Charity">Bantuan TJSL / Charity</option>
                  <option value="Program Flagship">Usulan Program Flagship</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Kategori Bantuan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-sky-500"
                >
                  <option value="Pemberdayaan Pertanian">Pemberdayaan Pertanian & Perikanan</option>
                  <option value="Bencana">Tanggap Darurat Bencana</option>
                  <option value="Pendidikan">Pendidikan & Vokasi</option>
                  <option value="Kesehatan">Kesehatan Masyarakat</option>
                  <option value="Keagamaan">Sarana Keagamaan</option>
                  <option value="Sarana Umum">Sarana Umum & Infrastruktur</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Nilai Pengajuan RAB (Rp) *</label>
                <input
                  type="number"
                  required
                  min={1000000}
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Wilayah / Lokasi</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Zona Operasi</label>
                  <select
                    value={ring}
                    onChange={(e) => setRing(e.target.value as 'Ring 1' | 'Ring 2' | 'Ring 3')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-sky-500"
                  >
                    <option value="Ring 1">Ring 1</option>
                    <option value="Ring 2">Ring 2</option>
                    <option value="Ring 3">Ring 3</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Proposal & Jalankan Validasi SBR Otomatis</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: TRACK & TRACE */}
      {activeTab === 'track' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pelacakan Status Pengajuan (Track & Trace)</h2>
            <p className="text-slate-600 mt-1">
              Masukkan nomor tiket proposal (contoh: <span className="font-mono">PROP-2026-104</span>, <span className="font-mono">PROP-2026-106</span>) atau 16 digit NIK untuk memantau posisi berkas secara transparan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 max-w-2xl">
            <div className="relative flex-1 min-w-60">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Masukkan Nomor Tiket atau NIK..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {state.proposals.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTrackQuery(p.ticketNo)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold"
                >
                  {p.ticketNo}
                </button>
              ))}
            </div>
          </div>

          {trackedProposal ? (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="font-mono font-bold text-sky-800">{trackedProposal.ticketNo}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{trackedProposal.applicant}</h3>
                  <p className="text-slate-600">
                    {trackedProposal.programType} &bull; {trackedProposal.category} &bull; {trackedProposal.location} ({trackedProposal.ring})
                  </p>
                  <p className="font-mono text-slate-500 mt-0.5">
                    NIK Terverifikasi: {maskNik(trackedProposal.nik, state.userRole)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-slate-500">Nilai Pengajuan</div>
                  <div className="text-lg font-bold text-slate-900">
                    Rp {trackedProposal.requestedAmount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {getTrackSteps(trackedProposal).map((st, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200">
                    {st.failed ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    ) : st.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{st.label}</div>
                      <div className="text-slate-600">{st.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              Nomor tiket atau NIK tidak ditemukan pada daftar proposal aktif.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PUBLIC GRIEVANCE CHANNEL (KAK M-06 / Mobile Pemohon) */}
      {activeTab === 'grievance' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Kanal Aspirasi & Pengaduan Masyarakat (Grievance Mechanism)</h2>
            <p className="text-slate-600 mt-1">
              Sampaikan masukan, keluhan pelaksanaan program, atau pelaporan ketidaksesuaian secara transparan. Tiket langsung diteruskan ke Action Tracker Tim Monev dengan pemantauan SLA 7 hari kerja.
            </p>
          </div>
          {grvSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
              ✓ Pengaduan Anda telah teregistrasi di sistem Monev & Grievance CSR dan tercatat di data/snapshot.json.
            </div>
          )}
          <form onSubmit={handlePublicGrievance} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Program / Kegiatan Terkait *</label>
                <input
                  type="text"
                  required
                  value={grvProgram}
                  onChange={(e) => setGrvProgram(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lokasi Kejadian *</label>
                <input
                  type="text"
                  required
                  value={grvLocation}
                  onChange={(e) => setGrvLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Uraian Aspirasi / Keluhan *</label>
              <textarea
                rows={4}
                required
                value={grvDesc}
                onChange={(e) => setGrvDesc(e.target.value)}
                placeholder="Tuliskan keluhan, kendala di lapangan, atau saran perbaikan program..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Tiket Pengaduan Masyarakat</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: PUBLIC UMK CATALOG */}
      {activeTab === 'catalog' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Etalase E-Katalog Produk UMK Binaan PT Timah Tbk</h2>
            <p className="text-slate-600 mt-1">
              Katalog produk unggulan mitra binaan UMK & Koperasi yang telah melalui kurasi kualitas dan sertifikasi (KAK K-08).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {state.umkCatalog.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">{item.category}</span>
                <div className="font-bold text-slate-900 text-base">{item.productName}</div>
                <div className="text-slate-600">{item.businessName} &bull; {item.location}</div>
                <div className="font-bold text-emerald-700">{item.priceRange}</div>
                <div className="pt-2 border-t border-slate-200 text-slate-700">
                  <div><strong>Sertifikasi:</strong> {item.certification}</div>
                  <div><strong>Mitra Off-Taker:</strong> {item.offTakerMatch}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
