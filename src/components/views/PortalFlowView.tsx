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
import { isViewAllowedInJourney, maskNik } from '../../utils/rbac';

interface PortalFlowViewProps {
  onNavigate: (view: NavView) => void;
}

export const PortalFlowView: React.FC<PortalFlowViewProps> = ({ onNavigate }) => {
  const state = useAppState();
  const isPublic = state.userRole === 'pemohon';
  const [activeTab, setActiveTab] = useState<'flow' | 'submit' | 'track' | 'grievance' | 'catalog'>(
    isPublic ? 'submit' : 'flow'
  );
  const selectedJourney = 'proposal' as const;

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

  const getTrackContext = (p: ProposalItem) => {
    const linkedProject = state.projects.find(
      (prj) =>
        prj.sourceProposalTicket === p.ticketNo ||
        (prj.partner.toLowerCase() === p.applicant.toLowerCase() &&
          prj.contractValue === p.requestedAmount)
    );
    const linkedCharity = state.charities.find(
      (c) =>
        c.nik === p.nik &&
        c.applicant.toLowerCase() === p.applicant.toLowerCase()
    );
    const linkedAsset = state.programAssets.find(
      (a) =>
        a.recipientCommunity.toLowerCase() === p.applicant.toLowerCase() &&
        (linkedProject ? a.programTitle === linkedProject.title : true)
    );

    const isRejected =
      p.adminScreeningStatus === 'Gugur' ||
      p.committeeDecision === 'Ditolak' ||
      p.approvalStatus === 'Ditolak';

    const isProjectCompleted = Boolean(
      linkedProject && linkedProject.bastSigned && linkedProject.lpjStatus === 'Terverifikasi'
    );
    const isCharityCompleted = Boolean(
      linkedCharity && linkedCharity.disbursementStatus === 'BAST Selesai'
    );
    const isFullyCompleted = isProjectCompleted || isCharityCompleted;

    let executionStepDetail = 'Menunggu konversi ke Implementasi & penyelesaian BAST';
    if (linkedProject) {
      executionStepDetail = isProjectCompleted
        ? `SELESAI 100% — ${linkedProject.spkNo} (PO SAP ${linkedProject.sapPoNo}: ${linkedProject.sapStatus}) • Realisasi Rp ${linkedProject.realizedValue.toLocaleString('id-ID')} • LPJ ${linkedProject.lpjStatus} • BAST Ditandatangani${
            linkedAsset ? ` (${linkedAsset.bastNo}) • Aset: ${linkedAsset.assetCode}` : ''
          }`
        : `Sedang berjalan (${linkedProject.spkNo}) — Progres fisik ${linkedProject.progressPercent}% • Realisasi Rp ${linkedProject.realizedValue.toLocaleString('id-ID')} • LPJ: ${linkedProject.lpjStatus} • Menunggu tutup LPJ & BAST`;
    } else if (linkedCharity) {
      executionStepDetail = isCharityCompleted
        ? `SELESAI — Tiket ${linkedCharity.ticketNo} • Dana cair & BAST Selesai${
            linkedCharity.bastNo ? ` (${linkedCharity.bastNo})` : ''
          }`
        : `Sedang diproses di Charity (${linkedCharity.ticketNo}) — Tahap saat ini: ${linkedCharity.disbursementStatus}`;
    } else if (isRejected) {
      executionStepDetail = 'Tidak dilanjutkan ke pelaksanaan karena berkas ditolak / gugur.';
    }

    const steps = [
      {
        label: '1. Registrasi Proposal & Validasi Berkas',
        done: true,
        failed: false,
        detail: `Tercatat ${p.dateSubmitted} via ${p.channel}`
      },
      {
        label: '2. Screening Administratif & Deduplikasi SBR',
        done: p.adminScreeningStatus === 'Lolos',
        failed: p.adminScreeningStatus === 'Gugur',
        detail: `Status SBR: ${p.sbrStatus} (Kemiripan NLP: ${p.nlpSimilarityPercent}%)`
      },
      {
        label: '3. Scoring Kuantitatif Multi-Reviewer',
        done: p.reviewerScores.length > 0,
        failed: false,
        detail:
          p.score !== undefined
            ? `Skor terkalibrasi: ${p.score} / 100 (${p.recommendation})`
            : 'Menunggu penilaian reviewer'
      },
      {
        label: '4. Forum Komite & Persetujuan Matriks Kewenangan',
        done: p.approvalStatus === 'Disetujui',
        failed: p.approvalStatus === 'Ditolak' || p.committeeDecision === 'Ditolak',
        detail: `Komite: ${p.committeeDecision} • Approval: ${p.approvalStatus}`
      },
      {
        label: '5. Konversi ke Implementasi SPK / Pencairan Charity',
        done: Boolean(p.convertedToImpl || linkedProject || linkedCharity),
        failed: false,
        detail: linkedProject
          ? `Terbit kontrak ${linkedProject.spkNo} (PO SAP ${linkedProject.sapPoNo}) & tercatat di SBR`
          : linkedCharity
          ? `Terbit tiket penyaluran ${linkedCharity.ticketNo} & tercatat di SBR`
          : p.convertedToImpl
          ? 'Aktif berjalan di Modul Implementasi & tercatat di SBR'
          : 'Menunggu penerbitan SPK / pencairan'
      },
      {
        label: '6. Realisasi Lapangan, LPJ, Serah Terima BAST & Aset',
        done: isFullyCompleted,
        failed: isRejected,
        detail: executionStepDetail
      }
    ];

    return {
      steps,
      linkedProject,
      linkedCharity,
      linkedAsset,
      isRejected,
      isFullyCompleted
    };
  };

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

      {/* TAB 1: CLOSED LOOP BUSINESS FLOW (Internal Only — 3 Visual Journeys) */}
      {!isPublic && activeTab === 'flow' && (() => {
        const journeys: Record<
          'proposal' | 'rkap' | 'pumk',
          {
            title: string;
            summary: string;
            steps: {
              num: number;
              title: string;
              role: string;
              targetView?: NavView;
              targetTab?: 'submit' | 'track' | 'grievance';
              action: string;
              result: string;
            }[];
          }
        > = {
          proposal: {
            title: 'Alur 1: Pengajuan Proposal Pemohon → Seleksi → Implementasi → Aset → Monev',
            summary: 'Alur paling umum yang dimulai dari masyarakat/lembaga mengajukan bantuan hingga realisasi lapangan, BAST aset, dan evaluasi.',
            steps: [
              {
                num: 1,
                title: 'Pengajuan Online & Cek NIK',
                role: 'Publik / Pemohon Portal',
                targetTab: 'submit',
                action: 'Isi form proposal & NIK 16 digit lalu klik Kirim.',
                result: 'Terbit tiket PROP, NIK masuk SBR, & masuk antrean Seleksi.'
              },
              {
                num: 2,
                title: 'Scoring Multi-Reviewer',
                role: 'Bidang Implementasi / Kadiv',
                targetView: 'seleksi',
                action: 'Buka /seleksi-proposal → klik Nilai → simpan skor rubrik.',
                result: 'Skor rata-rata terkalibrasi & rekomendasi otomatis.'
              },
              {
                num: 3,
                title: 'Komite & Approval Nominal',
                role: 'Kadiv (20–100 Jt) / Direksi (>100 Jt)',
                targetView: 'seleksi',
                action: 'Klik Setujui Rapat Komite → klik Approve sesuai nominal.',
                result: 'Otomatis menerbitkan SPK PPM atau Tiket Charity di /implementasi.'
              },
              {
                num: 4,
                title: 'Verifikasi Termin & BAST',
                role: 'Bidang Implementasi',
                targetView: 'implementasi',
                action: 'Buka Detail proyek → Verifikasi Output → Tutup LPJ & BAST.',
                result: 'Realisasi SAP 100% & Aset otomatis tercatat di /registry-sbr.'
              },
              {
                num: 5,
                title: 'Profil SBR, Aset & Track',
                role: 'Pemohon / SBR / SPI',
                targetView: 'sbr',
                action: 'Cek profil NIK, riwayat bantuan, & daftar aset hasil BAST.',
                result: 'Zero duplication terjaga & pemohon melihat 5 centang hijau.'
              },
              {
                num: 6,
                title: 'Monev, Aduan & Closed-Loop',
                role: 'Tim Monev / Perencanaan',
                targetView: 'monev',
                action: 'Tindak lanjut Grievance, evaluasi OECD-DAC, & konversi ke RKAP.',
                result: 'Menjadi Draft RKAP baru untuk siklus tahun berikutnya.'
              }
            ]
          },
          rkap: {
            title: 'Alur 2: Perencanaan RKAP Top-Down → Approval Berjenjang → Proyek PPM',
            summary: 'Alur program kerja tahunan dari Social Mapping hingga disahkan Direksi dan diturunkan ke Implementasi.',
            steps: [
              {
                num: 1,
                title: 'Social Mapping & Draft RKAP',
                role: 'Bidang Perencanaan',
                targetView: 'perencanaan',
                action: 'Input Social Mapping / Usulkan Program RKAP (atau Import XLSX).',
                result: 'Terbentuk program berstatus Draft dengan Theory of Change.'
              },
              {
                num: 2,
                title: 'Review Berjenjang Kabid → Kadiv',
                role: 'Perencanaan → Kepala Divisi CSR',
                targetView: 'perencanaan',
                action: 'Kabid ajukan Review Kabid → Kadiv klik Setujui Kadiv (e-Sign).',
                result: 'Status naik ke Review Kadiv menunggu pengesahan Direksi.'
              },
              {
                num: 3,
                title: 'Pengesahan Direksi & Turunkan',
                role: 'Direksi → Perencanaan/Kadiv',
                targetView: 'perencanaan',
                action: 'Direksi klik Sahkan Direksi → klik Turunkan ke PPM.',
                result: 'Otomatis membentuk Proyek SPK & PO SAP di /implementasi.'
              },
              {
                num: 4,
                title: 'Pelaksanaan, Flagship & SROI',
                role: 'Implementasi / Tim Monev',
                targetView: 'flagship',
                action: 'Pantau realisasi fisik, hitung SROI, & evaluasi dampak.',
                result: 'Tercatat sebagai capaian KPI, SROI, & Sustainability Report.'
              }
            ]
          },
          pumk: {
            title: 'Alur 3: Koperasi & Pendanaan PUMK (5C → Akad VA → Collection)',
            summary: 'Alur pembiayaan modal kerja UMK & pembinaan koperasi hingga pembayaran angsuran Virtual Account.',
            steps: [
              {
                num: 1,
                title: 'Onboarding & Analisis 5C',
                role: 'Bidang Koperasi & PUMK',
                targetView: 'pumk',
                action: 'Klik Pengajuan PUMK (5C) → sistem hitung Credit Score otomatis.',
                result: 'Masuk antrean Onboarding 5C & profil NIK tercatat di SBR.'
              },
              {
                num: 2,
                title: 'Survei Lapangan & Komite',
                role: 'Bidang PUMK / Kadiv CSR',
                targetView: 'pumk',
                action: 'Kirim Survei Lapangan → Ajukan ke Komite → Setujui Akad & Cairkan.',
                result: 'Otomatis terbit Akad & nomor Virtual Account (VA) di Portofolio.'
              },
              {
                num: 3,
                title: 'Angsuran VA & Collection',
                role: 'Bidang Koperasi & PUMK',
                targetView: 'pumk',
                action: 'Buka Detail Pinjaman → Simulasi Bayar VA / Collection / Restrukturisasi.',
                result: 'Baki debet, DPD, & rasio NPL otomatis terbarui ke snapshot.json.'
              },
              {
                num: 4,
                title: 'Koperasi & Naik Kelas (KUR)',
                role: 'Bidang PUMK / Publik',
                targetView: 'pumk',
                action: 'Pantau skor kesehatan koperasi & etalase E-Katalog UMK Binaan.',
                result: 'Mitra binaan lulus graduasi menuju pembiayaan perbankan.'
              }
            ]
          }
        };

        const activeJourney = journeys[selectedJourney];

        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Peta Visual Alur Proposal Pemohon</h2>
                  <p className="text-slate-600 mt-0.5">
                    Setiap tahapan terhubung otomatis dan menyimpan perubahan secara live ke <span className="font-mono font-semibold">data/snapshot.json</span>.
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-lg bg-sky-700 text-white font-semibold">
                  Fokus Aktif: Alur Proposal
                </span>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                <div className="font-bold text-sky-950">{activeJourney.title}</div>
                <div className="text-sky-900 mt-0.5">{activeJourney.summary}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeJourney.steps.map((step) => {
                  const canOpen = step.targetTab
                    ? true
                    : step.targetView
                    ? isViewAllowedInJourney(state.userRole, state.activeJourney, step.targetView)
                    : false;
                  return (
                    <div
                      key={step.num}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-sky-300 hover:shadow-sm transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 font-bold text-sky-900">
                            <span className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold">
                              {step.num}
                            </span>
                            <span>{step.title}</span>
                          </span>
                        </div>
                        <div className="inline-block px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold">
                          Peran: {step.role}
                        </div>
                        <div className="text-slate-800">
                          <strong>Aksi:</strong> {step.action}
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                          <strong>Hasil Otomatis:</strong> {step.result}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        {canOpen ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (step.targetTab) {
                                setActiveTab(step.targetTab);
                              } else if (step.targetView) {
                                onNavigate(step.targetView);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5"
                          >
                            <span>Buka Tahap {step.num}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 font-semibold inline-flex items-center gap-1.5">
                            <Lock className="w-4 h-4" />
                            <span>Khusus {step.role}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ringkasan Modul Aktif (Khusus Alur Proposal) */}
              <div className="pt-4 border-t border-slate-200">
                <div className="font-bold text-slate-800 mb-3">Akses Cepat Modul Alur Proposal:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {flowStages
                    .filter((stage) => isViewAllowedInJourney(state.userRole, state.activeJourney, stage.id))
                    .map((stage) => {
                      const allowed = true;
                      return (
                      <button
                        key={stage.id}
                        type="button"
                        disabled={!allowed}
                        onClick={() => allowed && onNavigate(stage.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          allowed
                            ? `${stage.accent} hover:shadow-sm cursor-pointer`
                            : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="p-2 rounded-lg bg-white/80 shadow-2xs flex-shrink-0">{stage.icon}</span>
                          <div className="min-w-0">
                            <div className="font-bold truncate">{stage.title}</div>
                            <div className="font-semibold opacity-80 truncate">{stage.metric}</div>
                          </div>
                        </div>
                        {allowed ? <ArrowRight className="w-4 h-4 flex-shrink-0" /> : <Lock className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <RefreshCcw className="w-6 h-6 text-sky-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-white">Closed-Loop Learning & Data Governance</div>
                    <div className="text-slate-300">
                      Rekomendasi evaluasi OECD-DAC dari Monev terhubung kembali ke Modul Perencanaan, didukung SBR, Import Data Tervalidasi, dan Audit Trail.
                    </div>
                  </div>
                </div>
                {isViewAllowedInJourney(state.userRole, state.activeJourney, 'import') && (
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
        );
      })()}

      {/* TAB 2: PORTAL PENGAJUAN */}
      {activeTab === 'submit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Portal Pengajuan Proposal & Bantuan Online</h2>
          <p className="text-slate-600 mt-1 mb-5">
            Usulan yang dikirimkan di sini otomatis melalui verifikasi deduplikasi NIK pada Single Beneficiary Registry (SBR) dan langsung masuk ke antrean Modul Seleksi Proposal.
          </p>

          {lastCreatedTicket && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-emerald-900 space-y-1">
                <div>
                  <strong>Pengajuan Teregistrasi!</strong> Nomor Tiket Anda:{' '}
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {lastCreatedTicket}
                  </span>
                </div>
                <div className="text-emerald-800">
                  Tersimpan ke <span className="font-mono font-semibold">data/snapshot.json</span> (Rev #{state.snapshotMeta.revision}) &bull; NIK otomatis tercatat di SBR dan antrean Seleksi Proposal.
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('track')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Lacak Status Tiket
                </button>
                {isViewAllowedInJourney(state.userRole, state.activeJourney, 'seleksi') && (
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
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 block">NIK Penanggung Jawab (16 Digit — Cek SBR) *</label>
                  <span className={`font-mono font-semibold ${nik.replace(/\D/g, '').length === 16 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {nik.replace(/\D/g, '').length}/16 digit
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
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

          {trackedProposal ? (() => {
            const ctx = getTrackContext(trackedProposal);
            const completedCount = ctx.steps.filter((s) => s.done).length;
            return (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                {/* Explicit Overall Completion Status Banner */}
                {ctx.isFullyCompleted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2 font-bold text-base text-emerald-900">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>SELESAI 100% — Pengajuan Tuntas, BAST Ditandatangani & Aset Tercatat</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-sm">
                        6 / 6 Tahap Tuntas
                      </span>
                    </div>
                    <p className="text-sm text-emerald-900">
                      Seluruh alur dari pengajuan pemohon, seleksi, persetujuan, realisasi dana, hingga serah terima <strong>BAST</strong> telah selesai. Tahap pascaprogram berikutnya adalah evaluasi dampak berkala oleh <strong>Tim Monev</strong> dan audit independen oleh <strong>SPI</strong>.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 text-sm">
                      {ctx.linkedProject && (
                        <>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 font-mono font-semibold text-emerald-900">
                            SPK: {ctx.linkedProject.spkNo}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 font-mono font-semibold text-emerald-900">
                            PO SAP: {ctx.linkedProject.sapPoNo} ({ctx.linkedProject.sapStatus})
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 font-semibold text-emerald-900">
                            Progres: {ctx.linkedProject.progressPercent}% · LPJ {ctx.linkedProject.lpjStatus}
                          </span>
                        </>
                      )}
                      {ctx.linkedCharity && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 font-mono font-semibold text-emerald-900">
                          Charity: {ctx.linkedCharity.ticketNo} · {ctx.linkedCharity.disbursementStatus}
                        </span>
                      )}
                      {ctx.linkedAsset && (
                        <>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 font-mono font-semibold text-emerald-900">
                            BAST: {ctx.linkedAsset.bastNo}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 font-mono font-semibold text-emerald-900">
                            Aset: {ctx.linkedAsset.assetCode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : ctx.isRejected ? (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 font-bold text-rose-900">
                      <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                      <span>PROSES BERHENTI — Pengajuan Ditolak / Gugur Verifikasi</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-sm">
                      Ditolak
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 font-bold text-amber-950">
                      <Clock className="w-5 h-5 text-amber-700 flex-shrink-0" />
                      <span>
                        BELUM SELESAI —{' '}
                        {ctx.linkedProject || ctx.linkedCharity
                          ? 'Sedang Berjalan di Tahap Implementasi (Menunggu Realisasi 100% & BAST)'
                          : 'Sedang Diproses pada Tahap Seleksi / Persetujuan'}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-sm">
                      {completedCount} / {ctx.steps.length} Tahap Selesai
                    </span>
                  </div>
                )}

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
                  {ctx.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        st.done
                          ? 'bg-white border-emerald-200'
                          : st.failed
                          ? 'bg-rose-50/60 border-rose-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
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
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-sm font-semibold flex-shrink-0 ${
                          st.failed
                            ? 'bg-rose-100 text-rose-800'
                            : st.done
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.failed ? 'Gugur' : st.done ? 'Selesai' : 'Menunggu'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })() : (
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
