import React, { useState } from 'react';
import { FlagshipProgram, FlagshipPerformanceScores } from '../../types';
import {
  Calculator,
  ArrowUpRight,
  Sliders,
  MapPin,
  ExternalLink,
  Award,
  BookOpen,
  Users,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Modal } from '../common/Modal';
import { PaginationBar } from '../common/PaginationBar';
import { useAppState } from '../../context/AppStateContext';
import { getRolePolicy } from '../../utils/rbac';

export const FlagshipView: React.FC = () => {
  const { userRole, flagships, updateFlagshipPerformance, advanceFlagshipTier } = useAppState();
  const policy = getRolePolicy(userRole);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedFlagship, setSelectedFlagship] = useState<FlagshipProgram | null>(null);
  const [detailFlagshipId, setDetailFlagshipId] = useState<string | null>(null);
  const [isSroiOpen, setIsSroiOpen] = useState(false);
  const [isPerfOpen, setIsPerfOpen] = useState(false);

  const detailFlagship = detailFlagshipId ? flagships.find((f) => f.id === detailFlagshipId) || null : null;

  // SROI calculator state
  const [investment, setInvestment] = useState<number>(1850000000);
  const [socialValue, setSocialValue] = useState<number>(7215000000);
  const [deadweight, setDeadweight] = useState<number>(12);
  const [attribution, setAttribution] = useState<number>(88);

  // KAK 8.2 Performance Scoring state
  const [perfScores, setPerfScores] = useState<FlagshipPerformanceScores>({
    output: 90,
    outcome: 86,
    efficiency: 84,
    governance: 88,
    satisfaction: 89
  });

  const calcPerfTotal = (s: FlagshipPerformanceScores) =>
    s.output * 0.25 + s.outcome * 0.35 + s.efficiency * 0.15 + s.governance * 0.15 + s.satisfaction * 0.10;

  const getPerfCategory = (score: number) => {
    if (score >= 85) return { label: 'Sangat Baik', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 70) return { label: 'Baik', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    if (score >= 55) return { label: 'Perlu Perbaikan', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Kritis (Corrective Action Plan)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const calculateSroiRatio = () => {
    const netBenefit = socialValue * (1 - deadweight / 100) * (attribution / 100);
    return (netBenefit / (investment || 1)).toFixed(2);
  };

  const openSroiCalc = (item?: FlagshipProgram) => {
    if (item) {
      setSelectedFlagship(item);
      setInvestment(item.investmentCost);
      setSocialValue(item.socialBenefitValue);
    }
    setIsSroiOpen(true);
  };

  const openPerfModal = (item: FlagshipProgram) => {
    setSelectedFlagship(item);
    setPerfScores(item.performanceScores);
    setIsPerfOpen(true);
  };

  const sroiChartData = flagships.map((f) => ({
    name: f.name.split(' ').slice(0, 3).join(' '),
    investasiM: Number((f.investmentCost / 1000000000).toFixed(2)),
    manfaatM: Number((f.socialBenefitValue / 1000000000).toFixed(2))
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Program Flagship / Unggulan Multi-Tahun & Pengukuran SROI</h2>
          <p className="text-slate-500 mt-0.5">
            Pengukuran Benefit Impact, Kalkulator SROI, Skoring Kinerja Periodik (KAK 8.2), Graduasi Penerima & Storytelling Publik.
          </p>
        </div>
        <button
          onClick={() => openSroiCalc()}
          className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold shadow-xs inline-flex items-center gap-1.5 flex-shrink-0"
        >
          <Calculator className="w-4 h-4" />
          <span>Kalkulator Simulasi SROI</span>
        </button>
      </div>

      {/* SROI Investment vs Benefit Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-slate-900">Perbandingan Investasi CSR vs Nilai Manfaat Sosial (Miliar Rupiah)</h3>
            <p className="text-slate-500">Visualisasi dampak ekonomi-sosial seluruh program unggulan aktif</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-slate-400"></span> Investasi CSR
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-emerald-600"></span> Nilai Manfaat Sosial
            </span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sroiChartData.slice(0, 6)} margin={{ top: 24, right: 20, left: 0, bottom: 0 }} barGap={6}>
              <defs>
                <linearGradient id="sroiInvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.75} />
                </linearGradient>
                <linearGradient id="sroiBenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.78} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#475569" fontSize={14} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={14} tickLine={false} axisLine={false} unit="M" />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                formatter={(val: any, name: any) => [`Rp ${val} Miliar`, name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  fontSize: '14px'
                }}
                itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                labelStyle={{ color: '#94a3b8', fontWeight: 700 }}
              />
              <Bar dataKey="investasiM" name="Investasi CSR" fill="url(#sroiInvGrad)" radius={[6, 6, 0, 0]} barSize={28}>
                <LabelList dataKey="investasiM" position="top" formatter={(v: any) => `${v}M`} style={{ fill: '#475569', fontWeight: 600, fontSize: 14 }} />
              </Bar>
              <Bar dataKey="manfaatM" name="Manfaat Sosial" fill="url(#sroiBenGrad)" radius={[6, 6, 0, 0]} barSize={28}>
                <LabelList dataKey="manfaatM" position="top" formatter={(v: any) => `${v}M`} style={{ fill: '#047857', fontWeight: 700, fontSize: 14 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flagship Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {flagships.slice((page - 1) * pageSize, page * pageSize).map((item) => {
          const perfTotal = calcPerfTotal(item.performanceScores);
          const perfCat = getPerfCategory(perfTotal);
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                    {item.code} &bull; {item.pillar}
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Tier: {item.graduationTier}
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setDetailFlagshipId(item.id)}
                    className="text-base font-bold text-slate-900 hover:text-sky-700 hover:underline leading-snug text-left"
                  >
                    {item.name}
                  </button>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-slate-500">{item.period}</span>
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(item.geotagCoord)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-rose-700 bg-slate-100 px-2 py-0.5 rounded font-mono"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.location}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 space-y-1">
                  <div><strong>Theory of Change:</strong> {item.theoryOfChange}</div>
                  <div><strong>Baseline:</strong> {item.baselineSummary}</div>
                  <div><strong>Target KPI:</strong> {item.kpiTargetSummary}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-500 block">Investasi / Manfaat:</span>
                    <span className="font-bold text-slate-900">
                      Rp {(item.investmentCost / 1000000000).toFixed(2)}M &rarr; Rp {(item.socialBenefitValue / 1000000000).toFixed(2)}M
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Rasio SROI:</span>
                    <span className="font-extrabold text-emerald-700 text-lg">1 : {item.sroiRatio}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Serapan Naker / Penerima:</span>
                    <span className="font-bold text-slate-800">+{item.jobsCreated} / {item.beneficiaries} Orang</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Skor Kinerja Periodik:</span>
                    <span className={`inline-block font-bold px-2 py-0.5 rounded border ${perfCat.color}`}>
                      {perfTotal.toFixed(1)} ({perfCat.label})
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
                  <div className="font-bold text-amber-900 inline-flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Success Story (Kurasi Publik):
                  </div>
                  <p className="text-amber-950 mt-1">{item.successStory}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 items-center text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold">Kolaborasi:</span> {item.collaborators.join(', ')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDetailFlagshipId(item.id)}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Detail</span>
                </button>
                <button
                  onClick={() => openSroiCalc(item)}
                  className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center justify-center gap-1"
                >
                  <span>Simulasi SROI</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                {policy.canScoreFlagship && (
                  <button
                    onClick={() => openPerfModal(item)}
                    className="py-2 px-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center justify-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Skoring Kinerja</span>
                  </button>
                )}
                {policy.canAdvanceFlagshipTier && (
                  <button
                    disabled={item.graduationTier === 'Naik Kelas'}
                    onClick={() => advanceFlagshipTier(item.id)}
                    className={`py-2 px-2.5 rounded-lg font-semibold inline-flex items-center justify-center gap-1 ${
                      item.graduationTier === 'Naik Kelas'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{item.graduationTier === 'Naik Kelas' ? 'Tier Tertinggi' : 'Naik Tier'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <PaginationBar
          totalItems={flagships.length}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modal: Detail Program Flagship */}
      <Modal
        isOpen={Boolean(detailFlagship)}
        onClose={() => setDetailFlagshipId(null)}
        title={`Detail Program Flagship — ${detailFlagship?.code || ''}`}
        maxWidth="max-w-3xl"
        footer={
          detailFlagship && (
            <>
              <button
                onClick={() => setDetailFlagshipId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const target = detailFlagship;
                  setDetailFlagshipId(null);
                  openSroiCalc(target);
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold"
              >
                Kalkulator SROI
              </button>
              {policy.canScoreFlagship && (
                <button
                  onClick={() => {
                    const target = detailFlagship;
                    setDetailFlagshipId(null);
                    openPerfModal(target);
                  }}
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                >
                  Ubah Skor Kinerja
                </button>
              )}
              {policy.canAdvanceFlagshipTier && detailFlagship.graduationTier !== 'Naik Kelas' && (
                <button
                  onClick={() => advanceFlagshipTier(detailFlagship.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold inline-flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Naikkan Tier Graduasi</span>
                </button>
              )}
            </>
          )
        }
      >
        {detailFlagship && (() => {
          const totalScore = calcPerfTotal(detailFlagship.performanceScores);
          const scoreCat = getPerfCategory(totalScore);
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                  {detailFlagship.code} &bull; {detailFlagship.pillar}
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  Tier: {detailFlagship.graduationTier}
                </span>
                <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                  Periode: {detailFlagship.period}
                </span>
                <span
                  className={`font-semibold px-2.5 py-1 rounded border ${
                    detailFlagship.ragStatus === 'Hijau'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : detailFlagship.ragStatus === 'Kuning'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  RAG: {detailFlagship.ragStatus}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{detailFlagship.name}</h3>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(detailFlagship.geotagCoord)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded font-mono border border-slate-200"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{detailFlagship.location} ({detailFlagship.geotagCoord})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Investasi CSR</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    Rp {(detailFlagship.investmentCost / 1000000000).toFixed(2)} M
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 block">Manfaat Sosial</span>
                  <div className="font-bold text-emerald-800 mt-0.5">
                    Rp {(detailFlagship.socialBenefitValue / 1000000000).toFixed(2)} M
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-sky-800 block">Rasio SROI</span>
                  <div className="text-lg font-extrabold text-sky-900 mt-0.5">1 : {detailFlagship.sroiRatio}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Naker / Penerima</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    +{detailFlagship.jobsCreated} / {detailFlagship.beneficiaries}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-800">
                <div><strong>Theory of Change:</strong> {detailFlagship.theoryOfChange}</div>
                <div><strong>Kondisi Baseline:</strong> {detailFlagship.baselineSummary}</div>
                <div><strong>Target KPI Multi-Tahun:</strong> {detailFlagship.kpiTargetSummary}</div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">Rincian Skor Kinerja Periodik (KAK 8.2)</span>
                  <span className={`px-2.5 py-0.5 rounded font-bold border ${scoreCat.color}`}>
                    Total: {totalScore.toFixed(1)} / 100 ({scoreCat.label})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: 'Output (25%)', val: detailFlagship.performanceScores.output },
                    { label: 'Outcome (35%)', val: detailFlagship.performanceScores.outcome },
                    { label: 'Efisiensi (15%)', val: detailFlagship.performanceScores.efficiency },
                    { label: 'Tata Kelola (15%)', val: detailFlagship.performanceScores.governance },
                    { label: 'Kepuasan (10%)', val: detailFlagship.performanceScores.satisfaction }
                  ].map((d) => (
                    <div key={d.label} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <div className="text-slate-500">{d.label}</div>
                      <div className="text-lg font-bold text-slate-900">{d.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-950 inline-flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Success Story (Kurasi Publik)
                </div>
                <p className="text-amber-950">{detailFlagship.successStory}</p>
                <div className="pt-2 border-t border-amber-200/80 text-slate-800 flex flex-wrap items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-600" />
                  <strong>Kolaborator:</strong> {detailFlagship.collaborators.join(', ')}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal: Skoring Kinerja Flagship (KAK 8.2) */}
      <Modal
        isOpen={isPerfOpen}
        onClose={() => setIsPerfOpen(false)}
        title={`Scoring Kinerja Periodik Flagship (KAK 8.2) — ${selectedFlagship?.name || ''}`}
        footer={
          <>
            <button onClick={() => setIsPerfOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 font-semibold">
              Batal
            </button>
            <button
              onClick={() => {
                if (selectedFlagship) {
                  updateFlagshipPerformance(selectedFlagship.id, perfScores);
                  setIsPerfOpen(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
            >
              Simpan Skor Kinerja
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {([
            { key: 'output', label: 'Capaian Output (% peserta terlatih, unit terbangun)', weight: '25%' },
            { key: 'outcome', label: 'Capaian Outcome / KPI (pendapatan, lapangan kerja)', weight: '35%' },
            { key: 'efficiency', label: 'Efisiensi Anggaran & Waktu (realisasi vs rencana)', weight: '15%' },
            { key: 'governance', label: 'Kepatuhan & Kualitas Tata Kelola (LPJ, temuan monev)', weight: '15%' },
            { key: 'satisfaction', label: 'Kepuasan & Keberlanjutan (kemandirian kelompok)', weight: '10%' }
          ] as const).map((dim) => (
            <div key={dim.key} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-800">{dim.label}</div>
                <div className="text-slate-500">Bobot KAK 8.2: <strong>{dim.weight}</strong></div>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={perfScores[dim.key]}
                onChange={(e) => setPerfScores({ ...perfScores, [dim.key]: Number(e.target.value) })}
                className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
              />
            </div>
          ))}

          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="text-slate-300">Skor Kinerja Terbobot:</div>
              <div className="text-2xl font-bold">{calcPerfTotal(perfScores).toFixed(1)} / 100</div>
            </div>
            <span className={`px-3 py-1 rounded font-bold border ${getPerfCategory(calcPerfTotal(perfScores)).color}`}>
              {getPerfCategory(calcPerfTotal(perfScores)).label}
            </span>
          </div>
        </div>
      </Modal>

      {/* Modal: Kalkulator SROI */}
      <Modal
        isOpen={isSroiOpen}
        onClose={() => setIsSroiOpen(false)}
        title={`Kalkulator SROI Otomatis — ${selectedFlagship?.name || 'Simulasi Program'}`}
        footer={
          <button
            onClick={() => setIsSroiOpen(false)}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
          >
            Tutup Kalkulator
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Menghitung rasio nilai moneter manfaat sosial-ekonomi bersih setelah dikurangi Deadweight & Drop-off serta disesuaikan dengan atribusi kontribusi perusahaan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Total Investasi CSR (Rp):</label>
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Nilai Manfaat Sosial Bruto (Rp):</label>
              <input
                type="number"
                value={socialValue}
                onChange={(e) => setSocialValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Deadweight & Drop-off (%):</label>
              <input
                type="number"
                value={deadweight}
                onChange={(e) => setDeadweight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Atribusi Program Perusahaan (%):</label>
              <input
                type="number"
                value={attribution}
                onChange={(e) => setAttribution(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <span className="font-bold text-emerald-800 uppercase tracking-wider block">
              Hasil Rasio SROI Bersih Teratribusi
            </span>
            <div className="text-3xl font-black text-emerald-700 my-1">1 : {calculateSroiRatio()}</div>
            <p className="text-emerald-900 font-medium">
              Setiap <strong>Rp 1,00</strong> investasi menghasilkan nilai manfaat sosial sebesar <strong>Rp {calculateSroiRatio()}</strong>.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
