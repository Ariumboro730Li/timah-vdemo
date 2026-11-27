import React, { useState } from 'react';
import { ProposalItem } from '../../types';
import {
  Search,
  Sliders,
  Upload,
  CheckCircle2,
  ArrowRightCircle,
  Users,
  AlertTriangle,
  Eye,
  MapPin,
  ExternalLink,
  FileCheck2,
  Clock,
  ShieldCheck,
  XCircle,
  Lock
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ImportDataModal } from '../common/ImportDataModal';
import { PaginationBar } from '../common/PaginationBar';
import { useAppState } from '../../context/AppStateContext';
import { getRolePolicy, canRoleApproveByAuthority, maskNik } from '../../utils/rbac';

export const SeleksiProposalView: React.FC = () => {
  const {
    userRole,
    setUserRole,
    showToast,
    proposals,
    sbrDatabase,
    scoringRubric,
    saveProposalScore,
    decideProposalCommittee,
    approveProposalFinal,
    convertProposalToExecution,
    getApproverByAmount
  } = useAppState();
  const policy = getRolePolicy(userRole);

  const switchToApproverRole = (approverLevel: 'Kabid' | 'Kepala Divisi' | 'Direksi / Komite') => {
    const targetRole =
      approverLevel === 'Direksi / Komite'
        ? 'direksi'
        : approverLevel === 'Kepala Divisi'
        ? 'kadiv'
        : 'implementasi';
    setUserRole(targetRole);
    showToast(`Beralih ke peran ${approverLevel} agar dapat memproses persetujuan ini.`, 'info');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedProposal, setSelectedProposal] = useState<ProposalItem | null>(null);
  const [detailProposalId, setDetailProposalId] = useState<string | null>(null);
  const [isScoringOpen, setIsScoringOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [reviewerName, setReviewerName] = useState('Hendra Saputra (Reviewer BI)');
  const [reviewNotes, setReviewNotes] = useState('Kelayakan administratif dan dampak sosial sesuai target Ring operasi.');
  const [scoresMap, setScoresMap] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    scoringRubric.forEach((c) => {
      init[c.key] = 85;
    });
    return init;
  });

  const detailProposal = detailProposalId ? proposals.find((p) => p.id === detailProposalId) || null : null;
  const detailSbrRecord = detailProposal ? sbrDatabase.find((b) => b.nik === detailProposal.nik) || null : null;

  const totalWeight = scoringRubric.reduce((acc, c) => acc + c.weight, 0) || 100;

  const calculateWeightedScore = () => {
    const sum = scoringRubric.reduce((acc, c) => acc + ((scoresMap[c.key] ?? 80) * c.weight), 0);
    return sum / totalWeight;
  };

  const finalScore = calculateWeightedScore();

  const getRecommendation = (score: number, sbrStatus?: ProposalItem['sbrStatus']) => {
    if (sbrStatus === 'Duplikasi Terdeteksi' || sbrStatus === 'Blacklist') {
      return { label: 'Gugur Otomatis (Knock-out SBR)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (score >= 80) return { label: 'Prioritas Disetujui', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 65) return { label: 'Layak Bersyarat', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Ditolak', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const openScoring = (prop: ProposalItem) => {
    setSelectedProposal(prop);
    const fresh: Record<string, number> = {};
    scoringRubric.forEach((c) => {
      fresh[c.key] = prop.score ? Math.round(prop.score) : 85;
    });
    setScoresMap(fresh);
    setIsScoringOpen(true);
  };

  const handleSaveScore = () => {
    if (!selectedProposal) return;
    saveProposalScore(selectedProposal.id, reviewerName, parseFloat(finalScore.toFixed(1)), reviewNotes);
    setIsScoringOpen(false);
  };

  const isRejectedProposal = (p: ProposalItem) =>
    p.approvalStatus === 'Ditolak' || p.recommendation === 'Ditolak';
  const isApprovedProposal = (p: ProposalItem) => p.approvalStatus === 'Disetujui';
  const isPendingProposal = (p: ProposalItem) =>
    p.approvalStatus === 'Menunggu' && !isRejectedProposal(p);

  const pendingCount = proposals.filter(isPendingProposal).length;
  const approvedCount = proposals.filter(isApprovedProposal).length;
  const rejectedCount = proposals.filter(isRejectedProposal).length;

  const filteredProposals = proposals.filter((p) => {
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && isPendingProposal(p)) ||
      (statusFilter === 'approved' && isApprovedProposal(p)) ||
      (statusFilter === 'rejected' && isRejectedProposal(p));
    if (!matchStatus) return false;
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      p.applicant.toLowerCase().includes(q) ||
      p.ticketNo.toLowerCase().includes(q) ||
      p.nik.includes(searchQuery)
    );
  });

  const handleSelectCardFilter = (next: 'all' | 'pending' | 'approved' | 'rejected') => {
    setStatusFilter((curr) => (curr === next && next !== 'all' ? 'all' : next));
    setPage(1);
  };

  const statusFilterLabels: Record<'all' | 'pending' | 'approved' | 'rejected', string> = {
    all: 'Semua Usulan',
    pending: 'Menunggu Seleksi / Approval',
    approved: 'Disetujui Komite & e-Sign',
    rejected: 'Ditolak / Knock-out'
  };

  const getSopTimeline = (p: ProposalItem) => [
    {
      step: 'Intake & Checklist Berkas',
      done: true,
      failed: false,
      note: `Masuk ${p.dateSubmitted} via ${p.channel}`
    },
    {
      step: 'Screening Administratif & SBR',
      done: p.adminScreeningStatus === 'Lolos',
      failed: p.adminScreeningStatus === 'Gugur',
      note: `SBR: ${p.sbrStatus} • Kemiripan NLP ${p.nlpSimilarityPercent}%`
    },
    {
      step: 'Scoring Multi-Reviewer',
      done: p.reviewerScores.length > 0,
      failed: false,
      note: p.score !== undefined ? `Skor kalibrasi ${p.score}/100 (${p.reviewerScores.length} penilai)` : 'Menunggu penilaian reviewer'
    },
    {
      step: 'Keputusan Komite Seleksi',
      done: p.committeeDecision === 'Disetujui Komite' || p.committeeDecision === 'Disetujui Bersyarat',
      failed: p.committeeDecision === 'Ditolak',
      note: p.committeeDecision
    },
    {
      step: `Approval Matriks (${getApproverByAmount(p.requestedAmount)})`,
      done: p.approvalStatus === 'Disetujui',
      failed: p.approvalStatus === 'Ditolak',
      note: `Status: ${p.approvalStatus}`
    },
    {
      step: 'Implementasi / Pencairan',
      done: Boolean(p.convertedToImpl),
      failed: false,
      note: p.convertedToImpl ? 'Sudah aktif di Modul Implementasi & tercatat di SBR' : 'Belum dikonversi ke SPK / Charity'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Summary — Interactive Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => handleSelectCardFilter('all')}
          className={`text-left bg-white rounded-xl p-4 shadow-sm transition-all cursor-pointer border ${
            statusFilter === 'all'
              ? 'border-sky-500 ring-2 ring-sky-200 bg-sky-50/30'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wider text-slate-500">Total Usulan Masuk</span>
            {statusFilter === 'all' && (
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">Aktif</span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{proposals.length} Proposal</div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCardFilter('pending')}
          className={`text-left bg-white rounded-xl p-4 shadow-sm transition-all cursor-pointer border ${
            statusFilter === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/40'
              : 'border-slate-200 hover:border-amber-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wider text-amber-600">Menunggu Seleksi / Approval</span>
            {statusFilter === 'pending' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">Aktif</span>
            )}
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount} Proposal</div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCardFilter('approved')}
          className={`text-left bg-white rounded-xl p-4 shadow-sm transition-all cursor-pointer border ${
            statusFilter === 'approved'
              ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/40'
              : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wider text-emerald-600">Disetujui Komite & e-Sign</span>
            {statusFilter === 'approved' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Aktif</span>
            )}
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount} Proposal</div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCardFilter('rejected')}
          className={`text-left bg-white rounded-xl p-4 shadow-sm transition-all cursor-pointer border ${
            statusFilter === 'rejected'
              ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/40'
              : 'border-slate-200 hover:border-rose-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wider text-rose-600">Ditolak / Knock-out</span>
            {statusFilter === 'rejected' && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">Aktif</span>
            )}
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{rejectedCount} Proposal</div>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">Intake Proposal, Screening SBR & Scoring Rubrik Terbobot</h3>
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-900 font-semibold">
                  <span>Filter: {statusFilterLabels[statusFilter]} ({filteredProposals.length})</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCardFilter('all')}
                    className="text-sky-700 hover:text-rose-700 font-bold underline"
                  >
                    Reset
                  </button>
                </span>
              )}
            </div>
            <p className="text-slate-500">
              Klik kartu ringkasan di atas untuk memfilter tabel, atau klik <strong>Detail</strong> untuk melihat berkas lengkap proposal & riwayat penilaian.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari pemohon, tiket, NIK..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
              />
            </div>
            {policy.allowedImportTypes.includes('proposal') && (
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-900 font-semibold inline-flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Import Batch (TEO / OCR)</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-3 px-4">Tiket & Kanal</th>
                <th className="py-3 px-4">Pemohon & Kategori</th>
                <th className="py-3 px-4">Usulan & Kewenangan</th>
                <th className="py-3 px-4">Cek SBR & NLP</th>
                <th className="py-3 px-4 text-center">Skor (Reviewer)</th>
                <th className="py-3 px-4">Keputusan & Status</th>
                <th className="py-3 px-4 text-right">Aksi Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProposals.slice((page - 1) * pageSize, page * pageSize).map((item) => {
                const approverLevel = getApproverByAmount(item.requestedAmount);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setDetailProposalId(item.id)}
                        className="font-mono font-bold text-sky-800 hover:text-sky-600 hover:underline text-left"
                      >
                        {item.ticketNo}
                      </button>
                      <div className="text-slate-500">{item.channel}</div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setDetailProposalId(item.id)}
                        className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                      >
                        {item.applicant}
                      </button>
                      <div className="font-mono text-slate-500">NIK: {maskNik(item.nik, userRole)}</div>
                      <div className="text-slate-600">
                        {item.programType} &bull; {item.category} ({item.ring})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">Rp {item.requestedAmount.toLocaleString('id-ID')}</div>
                      <div className="text-sky-700 font-medium">Penyetuju: {approverLevel}</div>
                      {item.rabAnomalyFlag && (
                        <div className="mt-1 inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Anomali RAB</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded font-semibold ${
                          item.sbrStatus === 'Unik (Bersih)' || item.sbrStatus === 'Terverifikasi'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.sbrStatus}
                      </span>
                      <div className="text-slate-500 mt-0.5">Kemiripan NLP: {item.nlpSimilarityPercent}%</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.score !== undefined ? (
                        <div>
                          <div className="font-bold text-slate-900">{item.score} / 100</div>
                          <div className="text-slate-500 inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {item.reviewerScores.length} Penilai
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Belum Dinilai</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold border ${
                          item.recommendation === 'Prioritas Disetujui'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.recommendation === 'Layak Bersyarat'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.recommendation === 'Ditolak'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.recommendation}
                      </span>
                      {/* Mini 4-step visual status trail */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {[
                          { label: '1. Nilai', done: item.score !== undefined },
                          {
                            label: '2. Komite',
                            done: item.committeeDecision === 'Disetujui Komite' || item.committeeDecision === 'Disetujui Bersyarat',
                            failed: item.committeeDecision === 'Ditolak'
                          },
                          {
                            label: '3. Approve',
                            done: item.approvalStatus === 'Disetujui',
                            failed: item.approvalStatus === 'Ditolak'
                          },
                          { label: '4. Impl', done: Boolean(item.convertedToImpl) }
                        ].map((st) => (
                          <span
                            key={st.label}
                            className={`px-1.5 py-0.5 rounded border font-semibold ${
                              st.failed
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : st.done
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            {st.done ? '✓ ' : st.failed ? '✗ ' : ''}
                            {st.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailProposalId(item.id)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                          {policy.canScoreProposal && (
                            <button
                              type="button"
                              onClick={() => openScoring(item)}
                              className="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>{item.score !== undefined ? 'Nilai' : 'Nilai'}</span>
                            </button>
                          )}
                        </div>

                        {item.score !== undefined && item.recommendation !== 'Ditolak' && item.committeeDecision === 'Belum Rapat' && (
                          policy.canCommitteeDecide ? (
                            <button
                              type="button"
                              onClick={() => decideProposalCommittee(item.id, 'Disetujui Komite')}
                              className="px-2.5 py-1 rounded bg-indigo-700 hover:bg-indigo-800 text-white font-semibold"
                            >
                              Setujui Rapat Komite
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setUserRole('kadiv');
                                showToast('Beralih ke Kepala Divisi CSR untuk keputusan Rapat Komite.', 'info');
                              }}
                              title="Klik untuk beralih ke peran Kepala Divisi CSR"
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 font-semibold inline-flex items-center gap-1"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Menunggu Komite (Pindah Kadiv)</span>
                            </button>
                          )
                        )}

                        {item.committeeDecision !== 'Belum Rapat' && item.committeeDecision !== 'Ditolak' && item.approvalStatus === 'Menunggu' && (
                          canRoleApproveByAuthority(userRole, approverLevel) ? (
                            <button
                              type="button"
                              onClick={() => approveProposalFinal(item.id)}
                              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve ({approverLevel})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => switchToApproverRole(approverLevel)}
                              title={`Sesuai Lampiran B KAK, nominal Rp ${item.requestedAmount.toLocaleString('id-ID')} memerlukan persetujuan ${approverLevel}. Klik untuk pindah ke peran tersebut.`}
                              className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold inline-flex items-center gap-1"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Pindah ke {approverLevel}</span>
                            </button>
                          )
                        )}

                        {item.approvalStatus === 'Disetujui' && !item.convertedToImpl && (
                          policy.canConvertProposal ? (
                            <button
                              type="button"
                              onClick={() => convertProposalToExecution(item.id)}
                              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold inline-flex items-center gap-1"
                            >
                              <ArrowRightCircle className="w-3.5 h-3.5" />
                              <span>Proses ke {item.programType === 'Bantuan Charity' ? 'Charity' : 'SPK PPM'}</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                              Siap Diproses BI
                            </span>
                          )
                        )}

                        {item.convertedToImpl && (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            ✓ Aktif di Implementasi
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <PaginationBar
          totalItems={filteredProposals.length}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* DETAIL PROPOSAL POPUP MODAL */}
      <Modal
        isOpen={Boolean(detailProposal)}
        onClose={() => setDetailProposalId(null)}
        title={`Detail Proposal — ${detailProposal?.ticketNo || ''}`}
        maxWidth="max-w-4xl"
        footer={
          detailProposal && (
            <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDetailProposalId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100"
              >
                Tutup
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {policy.canScoreProposal && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = detailProposal;
                      setDetailProposalId(null);
                      openScoring(target);
                    }}
                    className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>{detailProposal.score !== undefined ? 'Tambah Nilai Reviewer' : 'Nilai Rubrik'}</span>
                  </button>
                )}

                {detailProposal.score !== undefined &&
                  detailProposal.recommendation !== 'Ditolak' &&
                  detailProposal.committeeDecision === 'Belum Rapat' &&
                  (policy.canCommitteeDecide ? (
                    <>
                      <button
                        type="button"
                        onClick={() => decideProposalCommittee(detailProposal.id, 'Ditolak')}
                        className="px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold"
                      >
                        Tolak di Komite
                      </button>
                      <button
                        type="button"
                        onClick={() => decideProposalCommittee(detailProposal.id, 'Disetujui Komite')}
                        className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold"
                      >
                        Setujui Rapat Komite
                      </button>
                    </>
                  ) : (
                    <span className="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-semibold inline-flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>Menunggu Keputusan Komite (Kadiv/Direksi)</span>
                    </span>
                  ))}

                {detailProposal.committeeDecision !== 'Belum Rapat' &&
                  detailProposal.committeeDecision !== 'Ditolak' &&
                  detailProposal.approvalStatus === 'Menunggu' && (() => {
                    const reqApprover = getApproverByAmount(detailProposal.requestedAmount);
                    return canRoleApproveByAuthority(userRole, reqApprover) ? (
                      <button
                        type="button"
                        onClick={() => approveProposalFinal(detailProposal.id)}
                        className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve ({reqApprover})</span>
                      </button>
                    ) : (
                      <span className="px-3.5 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold inline-flex items-center gap-1.5">
                        <Lock className="w-4 h-4" />
                        <span>Terkunci — Kewenangan {reqApprover}</span>
                      </span>
                    );
                  })()}

                {detailProposal.approvalStatus === 'Disetujui' && !detailProposal.convertedToImpl && policy.canConvertProposal && (
                  <button
                    type="button"
                    onClick={() => convertProposalToExecution(detailProposal.id)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold inline-flex items-center gap-1.5"
                  >
                    <ArrowRightCircle className="w-4 h-4" />
                    <span>Proses ke {detailProposal.programType === 'Bantuan Charity' ? 'Charity' : 'SPK PPM'}</span>
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {detailProposal && (
          <div className="space-y-5">
            {/* Top Summary Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded">
                    {detailProposal.ticketNo}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    {detailProposal.channel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    {detailProposal.programType}
                  </span>
                  <span className="text-slate-500">Diajukan: {detailProposal.dateSubmitted}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">{detailProposal.applicant}</h4>
                <div className="flex flex-wrap items-center gap-3 text-slate-600">
                  <span>Kategori: <strong>{detailProposal.category}</strong></span>
                  <span>&bull;</span>
                  <span>Zona: <strong className="text-sky-800">{detailProposal.ring}</strong></span>
                  {detailProposal.geotagCoord && (
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(detailProposal.geotagCoord)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 font-mono"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{detailProposal.location} ({detailProposal.geotagCoord})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-right bg-white p-3 rounded-lg border border-slate-200 min-w-52">
                <div className="text-slate-500 font-semibold">Nilai Pengajuan RAB</div>
                <div className="text-xl font-extrabold text-slate-900">
                  Rp {detailProposal.requestedAmount.toLocaleString('id-ID')}
                </div>
                <div className="text-sky-700 font-semibold mt-0.5">
                  Matriks Approval: {getApproverByAmount(detailProposal.requestedAmount)}
                </div>
              </div>
            </div>

            {/* Alerts (Anomali RAB / Duplikasi SBR) */}
            {(detailProposal.rabAnomalyFlag || detailProposal.sbrStatus === 'Duplikasi Terdeteksi' || detailProposal.sbrStatus === 'Blacklist') && (
              <div className="space-y-2">
                {detailProposal.rabAnomalyFlag && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Peringatan Anomali RAB (KAK S-05):</strong> {detailProposal.rabAnomalyFlag}
                    </div>
                  </div>
                )}
                {(detailProposal.sbrStatus === 'Duplikasi Terdeteksi' || detailProposal.sbrStatus === 'Blacklist') && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-2.5">
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Knock-Out Otomatis SBR ({detailProposal.sbrStatus}):</strong> Terdeteksi duplikasi bantuan / catatan blacklist pada NIK <span className="font-mono font-bold">{maskNik(detailProposal.nik, userRole)}</span> dengan kemiripan dokumen NLP sebesar <strong>{detailProposal.nlpSimilarityPercent}%</strong>.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2-Column Info Grid: Legalitas & Checklist vs SBR & NLP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Legalitas & Document Checklist */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-sky-700" />
                  <span>Identitas, Legalitas & Checklist Berkas (S-01)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-slate-500 block">
                      NIK Penanggung Jawab
                    </span>
                    <span className="font-mono font-bold text-slate-900">{maskNik(detailProposal.nik, userRole)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">No. Legalitas / SK</span>
                    <span className="font-mono font-bold text-slate-900">{detailProposal.legalityNo}</span>
                  </div>
                </div>
                <ul className="space-y-1.5 text-slate-700">
                  {[
                    'Surat Permohonan & Proposal Kegiatan (PDF)',
                    'Rincian Anggaran Biaya (RAB) & Benchmark Unit Cost',
                    'Identitas KTP Penanggung Jawab (Terverifikasi e-KYC)',
                    'Dokumen Legalitas Lembaga / SK Desa / AHU',
                    'Deklarasi Bebas Benturan Kepentingan (COI)'
                  ].map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SBR History & AI/NLP Screening */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Hasil Screening SBR & Deteksi Kemiripan NLP</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">Status SBR</span>
                    <span
                      className={`font-bold ${
                        detailProposal.sbrStatus === 'Unik (Bersih)' || detailProposal.sbrStatus === 'Terverifikasi'
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {detailProposal.sbrStatus}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">Kemiripan Teks (NLP)</span>
                    <span
                      className={`font-bold ${
                        detailProposal.nlpSimilarityPercent >= 70 ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {detailProposal.nlpSimilarityPercent}% ({detailProposal.nlpSimilarityPercent >= 70 ? 'Tinggi / Mirip' : 'Aman'})
                    </span>
                  </div>
                </div>

                {detailSbrRecord ? (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-semibold text-slate-800">
                      Riwayat Bantuan Terdaftar di SBR ({detailSbrRecord.programHistory.length}):
                    </div>
                    {detailSbrRecord.programHistory.map((h, i) => (
                      <div key={i} className="text-slate-700 border-t border-slate-200/70 pt-1">
                        <strong>{h.year}</strong> — {h.programName} ({h.type}) &bull;{' '}
                        <strong>Rp {h.amount.toLocaleString('id-ID')}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    ✓ NIK belum pernah tercatat menerima bantuan CSR sebelumnya di Single Beneficiary Registry.
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Reviewer Score Log */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-700" />
                  <span>Riwayat Penilaian Multi-Reviewer & Kalibrasi Skor (S-03 / S-09)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Skor Akhir: {detailProposal.score !== undefined ? `${detailProposal.score} / 100` : 'Belum Dinilai'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                    {detailProposal.recommendation}
                  </span>
                </div>
              </div>

              {detailProposal.reviewerScores.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500">
                  Belum ada penilai yang memasukkan skor rubrik. Klik <strong>Nilai Rubrik</strong> untuk memulai penilaian.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {detailProposal.reviewerScores.map((rs, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">
                          {rs.reviewerName} <span className="font-normal text-slate-500">({rs.date})</span>
                        </div>
                        <div className="text-slate-600">{rs.notes}</div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-sky-100 text-sky-900 font-extrabold">
                        {rs.totalScore} / 100
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SOP 11.1 Step-by-Step Timeline */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="font-bold text-slate-900">Progres Tahapan Seleksi Proposal (SOP 11.1)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {getSopTimeline(detailProposal).map((st, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                      st.failed
                        ? 'bg-rose-50 border-rose-200'
                        : st.done
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {st.failed ? (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    ) : st.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{st.step}</div>
                      <div className="text-slate-600">{st.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Multi-Reviewer Dynamic Scoring Modal */}
      <Modal
        isOpen={isScoringOpen}
        onClose={() => setIsScoringOpen(false)}
        title={`Penilaian Rubrik Terbobot (Multi-Reviewer) — ${selectedProposal?.ticketNo || ''}`}
        maxWidth="max-w-3xl"
        footer={
          <>
            <button
              onClick={() => setIsScoringOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              onClick={handleSaveScore}
              className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold shadow-xs"
            >
              Simpan Penilaian & Kalibrasi Skor
            </button>
          </>
        }
      >
        {selectedProposal && (
          <div className="space-y-4">
            <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-lg flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-bold text-sky-950">{selectedProposal.applicant}</div>
                <div className="text-sky-800">
                  Nilai Usulan: Rp {selectedProposal.requestedAmount.toLocaleString('id-ID')} &bull; SBR: {selectedProposal.sbrStatus}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 uppercase font-semibold block">Skor Penilai Ini:</span>
                <div className="text-2xl font-black text-sky-800">{finalScore.toFixed(1)} / 100</div>
              </div>
            </div>

            {selectedProposal.reviewerScores.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="font-bold text-slate-800">Riwayat Penilai Sebelumnya (Kalibrasi Rata-Rata):</div>
                {selectedProposal.reviewerScores.map((rs, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 border-t border-slate-200/70 pt-1">
                    <span>
                      <strong>{rs.reviewerName}</strong> ({rs.date}): {rs.notes}
                    </span>
                    <span className="font-bold text-sky-800 ml-2">{rs.totalScore}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Penilai (Reviewer):</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Justifikasi Penilaian:</label>
                <input
                  type="text"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              {scoringRubric.map((crit, idx) => (
                <div
                  key={crit.id}
                  className={`p-3 flex items-center justify-between gap-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                >
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800">
                      {crit.name} {crit.mandatory ? '*' : ''}
                    </span>
                    <span className="text-slate-500 block">
                      Bobot: <strong>{crit.weight}%</strong> &bull; {crit.description}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={scoresMap[crit.key] ?? 80}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      const clamped = Number.isNaN(raw) ? 0 : Math.min(100, Math.max(0, raw));
                      setScoresMap({ ...scoresMap, [crit.key]: clamped });
                    }}
                    className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                  />
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <span className="font-bold text-slate-700">Rekomendasi Otomatis (Ambang KAK 8.1):</span>
              <span className={`px-3 py-1 rounded font-bold border ${getRecommendation(finalScore, selectedProposal.sbrStatus).color}`}>
                {getRecommendation(finalScore, selectedProposal.sbrStatus).label}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <ImportDataModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        defaultType="proposal"
      />
    </div>
  );
};
