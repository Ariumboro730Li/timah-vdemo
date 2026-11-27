import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList
} from 'recharts';
import { MetricCard } from '../common/MetricCard';
import { PaginationBar } from '../common/PaginationBar';
import { Modal } from '../common/Modal';
import { DollarSign, Users, Award, TrendingUp, Download, ArrowRight, CheckCircle2, AlertTriangle, MapPin, Eye, ExternalLink, Camera, QrCode, BookOpen, Send } from 'lucide-react';
import { NavView, ProjectItem } from '../../types';
import { useAppState } from '../../context/AppStateContext';
import { exportRowsToExcel } from '../../utils/dataImportExport';
import { getRolePolicy, isViewAllowed } from '../../utils/rbac';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
}

const REGION_BAR_COLORS = ['#0284c7', '#0ea5e9', '#14b8a6', '#10b981', '#6366f1', '#8b5cf6'];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    userRole,
    monthlyBudgetData,
    pillarDistributionData,
    regionalDistributionData,
    rkapList,
    proposals,
    projects,
    charities,
    flagships,
    pumkLoans,
    monevIssues,
    sbrDatabase
  } = useAppState();

  const [selectedPillar, setSelectedPillar] = useState<string>('Semua');
  const [projPage, setProjPage] = useState(1);
  const [projPageSize, setProjPageSize] = useState(5);
  const [detailProject, setDetailProject] = useState<ProjectItem | null>(null);

  const totalRkapBudget = rkapList.reduce((acc, r) => acc + r.budget, 0);
  const totalRealized =
    projects.reduce((acc, p) => acc + p.realizedValue, 0) +
    charities
      .filter((c) => c.disbursementStatus === 'Cair ke Penerima' || c.disbursementStatus === 'BAST Selesai')
      .reduce((acc, c) => acc + c.requestedAmount, 0);
  const avgSroi = flagships.length
    ? (flagships.reduce((acc, f) => acc + f.sroiRatio, 0) / flagships.length).toFixed(2)
    : '3.50';
  const totalBakiPumk = pumkLoans.reduce((acc, l) => acc + l.remainingPrincipal, 0);
  const nplPrincipal = pumkLoans.filter((l) => l.dpd > 90).reduce((acc, l) => acc + l.remainingPrincipal, 0);
  const nplRatio = totalBakiPumk > 0 ? ((nplPrincipal / totalBakiPumk) * 100).toFixed(2) : '0.00';

  const pendingProposals = proposals.filter((p) => p.approvalStatus === 'Menunggu').length;
  const openIssues = monevIssues.filter((i) => i.status !== 'Selesai Verifikasi').length;

  const filteredProjects =
    selectedPillar === 'Semua' ? projects : projects.filter((p) => p.pillar === selectedPillar);

  const totalPillarM = pillarDistributionData.reduce((acc, p) => acc + p.value, 0);
  const topRegion = regionalDistributionData[0];
  const latestMonth = monthlyBudgetData[monthlyBudgetData.length - 1];
  const ytdRealizationPct = latestMonth?.target
    ? Math.round((latestMonth.realisasi / latestMonth.target) * 100)
    : 92;

  const policy = getRolePolicy(userRole);
  const isPublic = userRole === 'pemohon';
  const dashboardLevelLabel = policy.dashboardLevel;

  const handleExportSummary = () => {
    const rows = projects.map((p) => ({
      No_SPK: p.spkNo,
      Judul_Proyek: p.title,
      Mitra: p.partner,
      Pilar: p.pillar,
      Lokasi: p.location,
      Nilai_Kontrak: p.contractValue,
      Realisasi: p.realizedValue,
      Progres_Persen: p.progressPercent,
      Status_RAG: p.ragStatus,
      SAP_PO: p.sapPoNo
    }));
    exportRowsToExcel(rows, 'Ringkasan_TJSL', 'dashboard_ringkasan_tjsl_2026.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Level & Quick Filter Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-bold text-slate-900">{dashboardLevelLabel}</span>
          <p className="text-sm text-slate-500">{policy.scopeSummary}</p>
        </div>
        {/* <div className="flex flex-wrap items-center gap-2">
          {!isPublic && (
            <select
              value={selectedPillar}
              onChange={(e) => {
                setSelectedPillar(e.target.value);
                setProjPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="Semua">Semua Pilar TJSL</option>
              <option value="Ekonomi">Pilar Ekonomi</option>
              <option value="Lingkungan">Pilar Lingkungan</option>
              <option value="Sosial">Pilar Sosial</option>
            </select>
          )}
          {isViewAllowed(userRole, 'portal') && (
            <button
              onClick={() => onNavigate('portal')}
              className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-800 text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <span>{isPublic ? 'Ajukan Proposal / Lacak Tiket' : 'Lihat Alur End-to-End'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {policy.canExportReports && (
            <button
              onClick={handleExportSummary}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>
          )}
        </div> */}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Pagu RKAP Aktif"
          value={`Rp ${(totalRkapBudget / 1000000000).toFixed(2)} M`}
          subtext={`${rkapList.length} Program • Realisasi Rp ${(totalRealized / 1000000000).toFixed(2)} M`}
          icon={<DollarSign className="w-4 h-4 text-sky-600" />}
          onClick={isViewAllowed(userRole, 'perencanaan') ? () => onNavigate('perencanaan') : undefined}
        />
        <MetricCard
          label="Penerima Tervalidasi SBR"
          value={`${sbrDatabase.length} Profil`}
          subtext="✓ Validasi NIK & Zero Duplikasi Aktif"
          icon={<Users className="w-4 h-4 text-emerald-600" />}
          onClick={isViewAllowed(userRole, 'sbr') ? () => onNavigate('sbr') : undefined}
        />
        <MetricCard
          label="Rata-rata Skor SROI"
          value={`1 : ${avgSroi}`}
          subtext={`${flagships.length} Program Flagship Multi-Tahun`}
          icon={<Award className="w-4 h-4 text-indigo-600" />}
          onClick={isViewAllowed(userRole, 'flagship') ? () => onNavigate('flagship') : undefined}
        />
        <MetricCard
          label="Portofolio Baki PUMK"
          value={`Rp ${(totalBakiPumk / 1000000000).toFixed(2)} M`}
          subtext={`${pumkLoans.length} Debitur • NPL >90h: ${nplRatio}%`}
          isPositive={Number(nplRatio) <= 5}
          icon={<TrendingUp className="w-4 h-4 text-amber-600" />}
          onClick={isViewAllowed(userRole, 'pumk') ? () => onNavigate('pumk') : undefined}
        />
      </div>

      {/* Operational Alert Strip (Internal) vs Public Portal CTA (Eksternal) */}
      {isPublic ? (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-sky-700 flex-shrink-0" />
            <div>
              <div className="font-bold text-sky-950">Layanan Mandiri Masyarakat & Mitra Binaan (KAK Bab 7.5 — Data Teragregasi & Anonim)</div>
              <div className="text-sm text-sky-900">
                Ajukan proposal bantuan TJSL/PPM secara online, lacak status berkas real-time, atau sampaikan aspirasi/pengaduan melalui Portal Pemohon.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('portal')}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold flex-shrink-0"
          >
            Buka Portal Pemohon &rarr;
          </button>
        </div>
      ) : (
        (pendingProposals > 0 || openIssues > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-amber-950">{pendingProposals} Proposal Menunggu Seleksi / Persetujuan</div>
                  <div className="text-sm text-amber-800">Target SLA KAK: proses seleksi turun ≥ 40% dari baseline 45 hari.</div>
                </div>
              </div>
              {isViewAllowed(userRole, 'seleksi') && (
                <button
                  onClick={() => onNavigate('seleksi')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex-shrink-0"
                >
                  Buka Seleksi
                </button>
              )}
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-700 flex-shrink-0" />
                <div>
                  <div className="font-bold text-sky-950">{openIssues} Tiket Monev & Grievance Dalam Tindak Lanjut</div>
                  <div className="text-sm text-sky-800">Pemantauan deviasi lapangan berkoordinat Google Maps & SLA.</div>
                </div>
              </div>
              {isViewAllowed(userRole, 'monev') && (
                <button
                  onClick={() => onNavigate('monev')}
                  className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold flex-shrink-0"
                >
                  Buka Monev
                </button>
              )}
            </div>
          </div>
        )
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Realization Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tren Realisasi Anggaran vs Target Bulanan</h2>
              <p className="text-sm text-slate-500">Akumulasi serapan anggaran & komitmen SAP tahun berjalan (Miliar Rupiah)</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                Serapan YTD {ytdRealizationPct}%
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Realisasi
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Komitmen
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Target
              </span>
            </div>
          </div>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyBudgetData} margin={{ top: 12, right: 16, left: -4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRealisasi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradKomitmen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={14} tickLine={false} axisLine={false} dy={6} />
                <YAxis stroke="#64748b" fontSize={14} tickLine={false} axisLine={false} unit="M" />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `Rp ${value} M`,
                    name === 'realisasi' ? 'Realisasi Cair' : name === 'commitment' ? 'Komitmen SAP' : 'Target RKAP'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
                    fontSize: '14px'
                  }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  fill="transparent"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="commitment"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradKomitmen)"
                />
                <Area
                  type="monotone"
                  dataKey="realisasi"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#gradRealisasi)"
                  activeDot={{ r: 6, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pillar Breakdown Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Distribusi Pagu per Pilar TJSL</h2>
            <p className="text-sm text-slate-500">Proporsi alokasi pilar strategis & SDGs</p>
          </div>
          <div className="relative h-56 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pillarDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={4}
                  cornerRadius={6}
                  dataKey="value"
                  stroke="none"
                >
                  {pillarDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`Rp ${value} M`, 'Alokasi Pagu']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '14px'
                  }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center KPI Overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-slate-400 font-semibold">Total Pagu</span>
              <span className="text-lg font-extrabold text-slate-900">Rp {totalPillarM.toFixed(1)} M</span>
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100 text-sm">
            {pillarDistributionData.map((item, i) => {
              const pct = totalPillarM > 0 ? Math.round((item.value / totalPillarM) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-700 truncate">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate font-medium">{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    Rp {item.value} M <span className="text-slate-400 font-medium">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regional Allocation Bar Chart & Active Projects (5 Rows) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Regional Allocation Chart — Balanced height + Rich Styling */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Alokasi Wilayah Operasi (Ring Tambang)</h2>
              <p className="text-sm text-slate-500">Sebaran anggaran pada area operasi utama</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-bold flex-shrink-0">
              {regionalDistributionData.length} Wilayah
            </span>
          </div>

          <div className="flex-1 min-h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionalDistributionData}
                layout="vertical"
                margin={{ top: 8, right: 68, left: 6, bottom: 8 }}
                barCategoryGap="22%"
              >
                <defs>
                  {REGION_BAR_COLORS.map((color, idx) => (
                    <linearGradient key={idx} id={`regGrad${idx}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={color} stopOpacity={0.82} />
                      <stop offset="100%" stopColor={color} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" unit="M" stroke="#64748b" fontSize={14} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="region"
                  type="category"
                  stroke="#334155"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  width={132}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(val: any, _name: any, props: any) => [
                    `Rp ${val} Miliar (${props?.payload?.projects || 0} Program)`,
                    'Alokasi Pagu'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '14px'
                  }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 600 }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 700, marginBottom: '2px' }}
                />
                <Bar
                  dataKey="budget"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                  background={{ fill: '#f1f5f9', radius: 8 }}
                >
                  {regionalDistributionData.map((_entry, index) => (
                    <Cell key={`reg-${index}`} fill={`url(#regGrad${index % REGION_BAR_COLORS.length})`} />
                  ))}
                  <LabelList
                    dataKey="budget"
                    position="right"
                    formatter={(v: any) => `Rp ${v}M`}
                    style={{ fill: '#0f172a', fontWeight: 700, fontSize: 14 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {topRegion && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50 rounded-lg px-3.5 py-2.5">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>Prioritas Tertinggi: <strong className="text-slate-900">{topRegion.region}</strong></span>
              </div>
              <span className="font-bold text-sky-800">
                Rp {topRegion.budget} M ({topRegion.projects} Program)
              </span>
            </div>
          )}
        </div>

        {/* Active Projects Table (Internal) vs Public Impact Stories (Eksternal Anonim) */}
        {isPublic ? (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-700" />
                  <span>Galeri Cerita Dampak & Program Unggulan (Publik Anonim)</span>
                </h2>
                <p className="text-sm text-slate-500">Ringkasan dampak sosial-ekonomi teragregasi tanpa membuka data pribadi/SPK internal</p>
              </div>
            </div>
            <div className="p-5 space-y-3 flex-1">
              {flagships.slice(0, 4).map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{f.name}</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      SROI 1 : {f.sroiRatio}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    {f.pillar} &bull; {f.location} &bull; <strong>{f.beneficiaries} Penerima Manfaat</strong> (+{f.jobsCreated} Tenaga Kerja)
                  </div>
                  <p className="text-slate-700">{f.successStory}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Program Implementasi & Status RAG (Drill-Down)</h2>
              <p className="text-sm text-slate-500">Pemantauan langsung proyek aktif vs komitmen SAP FICO</p>
            </div>
            {isViewAllowed(userRole, 'implementasi') && (
              <button
                onClick={() => onNavigate('implementasi')}
                className="text-sm font-semibold text-sky-600 hover:text-sky-700"
              >
                Kelola Implementasi &rarr;
              </button>
            )}
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="py-3 px-4 font-semibold">Nama Proyek</th>
                  <th className="py-3 px-4 font-semibold">Mitra Pelaksana</th>
                  <th className="py-3 px-4 font-semibold">Nilai SPK</th>
                  <th className="py-3 px-4 font-semibold">Progres Fisik</th>
                  <th className="py-3 px-4 font-semibold">Status RAG</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.slice((projPage - 1) * projPageSize, projPage * projPageSize).map((prj) => (
                  <tr key={prj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setDetailProject(prj)}
                        className="font-semibold text-slate-800 hover:text-sky-700 hover:underline text-left"
                      >
                        {prj.title}
                      </button>
                      <div className="text-sm text-slate-400 font-mono">{prj.spkNo}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{prj.partner}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      Rp {(prj.contractValue / 1000000).toLocaleString('id-ID')} Jt
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              prj.progressPercent === 100
                                ? 'bg-emerald-500'
                                : prj.ragStatus === 'Kuning'
                                ? 'bg-amber-500'
                                : 'bg-sky-500'
                            }`}
                            style={{ width: `${prj.progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-slate-700">{prj.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-semibold ${
                          prj.ragStatus === 'Hijau'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : prj.ragStatus === 'Kuning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {prj.ragStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailProject(prj)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            totalItems={filteredProjects.length}
            currentPage={projPage}
            pageSize={projPageSize}
            onPageChange={setProjPage}
            onPageSizeChange={setProjPageSize}
          />
        </div>
        )}
      </div>

      {/* Detail Proyek Popup */}
      <Modal
        isOpen={Boolean(detailProject)}
        onClose={() => setDetailProject(null)}
        title={`Detail Proyek Implementasi — ${detailProject?.spkNo || ''}`}
        maxWidth="max-w-3xl"
        footer={
          detailProject && (
            <>
              <button
                type="button"
                onClick={() => setDetailProject(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Tutup
              </button>
              {isViewAllowed(userRole, 'implementasi') && (
                <button
                  type="button"
                  onClick={() => {
                    setDetailProject(null);
                    onNavigate('implementasi');
                  }}
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                >
                  Kelola di Modul Implementasi &rarr;
                </button>
              )}
            </>
          )
        }
      >
        {detailProject && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono font-bold text-sky-800">{detailProject.spkNo} &bull; PO SAP: {detailProject.sapPoNo}</div>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{detailProject.title}</h4>
                <div className="text-slate-600 mt-1">Mitra Pelaksana: <strong>{detailProject.partner}</strong></div>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(detailProject.geotagCoord)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded border border-slate-200 font-mono text-slate-700"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{detailProject.location} ({detailProject.geotagCoord})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-right">
                <div className="text-slate-500">Realisasi vs Kontrak</div>
                <div className="font-extrabold text-slate-900">
                  Rp {detailProject.realizedValue.toLocaleString('id-ID')}
                </div>
                <div className="text-slate-500">dari Rp {detailProject.contractValue.toLocaleString('id-ID')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Progres & Status RAG</div>
                <div className="font-bold text-slate-900 mt-0.5">{detailProject.progressPercent}% ({detailProject.ragStatus})</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Bukti Lapangan</div>
                <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1"><Camera className="w-4 h-4 text-sky-600" /> {detailProject.geotagPhotos} Foto</span>
                  <span className="inline-flex items-center gap-1"><QrCode className="w-4 h-4 text-slate-500" /> {detailProject.qrAttendanceCount} QR</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">SAP & LPJ / BAST</div>
                <div className="font-bold text-slate-900 mt-0.5">{detailProject.sapStatus} &bull; LPJ {detailProject.lpjStatus}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-800">Milestone Pelaksanaan:</div>
              {detailProject.milestones.map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{m.name}</div>
                    <div className="text-slate-500">Target: {m.targetDate} &bull; Bobot {m.weightPercent}%</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">{m.status}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
              <strong>Exit Strategy:</strong> {detailProject.exitStrategy}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
