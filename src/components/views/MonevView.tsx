import React, { useState } from 'react';
import { MonevIssue } from '../../types';
import {
  MapPin,
  FileSpreadsheet,
  Plus,
  ExternalLink,
  RefreshCcw,
  CheckCircle2,
  ClipboardCheck,
  Eye
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Modal } from '../common/Modal';
import { PaginationBar } from '../common/PaginationBar';
import { useAppState } from '../../context/AppStateContext';
import { exportRowsToExcel } from '../../utils/dataImportExport';
import { getRolePolicy } from '../../utils/rbac';

export const MonevView: React.FC = () => {
  const {
    userRole,
    activeJourney,
    monevIndicators,
    monevIssues,
    lessonsLearned,
    projects,
    addMonevIssue,
    updateMonevIssueStatus,
    applyLessonToRkap
  } = useAppState();
  const policy = getRolePolicy(userRole);

  const [activeTab, setActiveTab] = useState<'issues' | 'indicators' | 'oecd'>('issues');
  const [issPage, setIssPage] = useState(1);
  const [issPageSize, setIssPageSize] = useState(5);
  const [indPage, setIndPage] = useState(1);
  const [indPageSize, setIndPageSize] = useState(5);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);

  const selectedIssue = selectedIssueId ? monevIssues.find((i) => i.id === selectedIssueId) || null : null;
  const selectedIndicator = selectedIndicatorId ? monevIndicators.find((i) => i.id === selectedIndicatorId) || null : null;

  // Add Issue / Grievance form state
  const [issProgram, setIssProgram] = useState('Dermaga Apung Nelayan Sukadamai');
  const [issLoc, setIssLoc] = useState('Toboali, Bangka Selatan');
  const [issCategory, setIssCategory] = useState<MonevIssue['category']>('Keluhan Warga (Grievance)');
  const [issSource, setIssSource] = useState<MonevIssue['source']>('Grievance Masyarakat');
  const [issDesc, setIssDesc] = useState('');
  const [issCoord, setIssCoord] = useState('-2.9812, 106.1245');
  const [issPic, setIssPic] = useState('Dedi Kurniawan (Tim Monev)');

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issDesc.trim()) return;
    addMonevIssue({
      programTitle: issProgram,
      location: issLoc,
      category: issCategory,
      source: issSource,
      description: issDesc.trim(),
      pic: issPic,
      deadline: '07 Des 2026',
      status: 'Dalam Investigasi',
      slaDaysRemaining: 7,
      geotagCoord: issCoord
    });
    setIssDesc('');
    setIsAddIssueOpen(false);
  };

  const handleExportGriReport = () => {
    const rows = [
      ...monevIndicators.map((ind) => ({
        Kategori_Laporan: 'Indikator KPI (GRI / SR)',
        Kode: ind.code,
        Program: ind.programName,
        Indikator: ind.indicatorName,
        Baseline: ind.baseline,
        Target: ind.target,
        Realisasi: ind.actual,
        Capaian_Persen: ind.achievementPercent,
        Status_RAG: ind.ragStatus
      })),
      ...projects.map((p) => ({
        Kategori_Laporan: 'Realisasi Program TJSL',
        Kode: p.spkNo,
        Program: p.title,
        Indikator: `Realisasi Rp ${p.realizedValue.toLocaleString('id-ID')}`,
        Baseline: '0%',
        Target: '100%',
        Realisasi: `${p.progressPercent}%`,
        Capaian_Persen: p.progressPercent,
        Status_RAG: p.ragStatus
      }))
    ];
    exportRowsToExcel(rows, 'Laporan_TJSL_GRI', 'laporan_tjsl_sustainability_gri_2026.xlsx');
  };

  const oecdChartData = lessonsLearned[0]
    ? [
        { dimensi: 'Relevansi', skor: lessonsLearned[0].oecdDac.relevance },
        { dimensi: 'Koherensi', skor: lessonsLearned[0].oecdDac.coherence },
        { dimensi: 'Efektivitas', skor: lessonsLearned[0].oecdDac.effectiveness },
        { dimensi: 'Efisiensi', skor: lessonsLearned[0].oecdDac.efficiency },
        { dimensi: 'Dampak', skor: lessonsLearned[0].oecdDac.impact },
        { dimensi: 'Keberlanjutan', skor: lessonsLearned[0].oecdDac.sustainability }
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Tabs & Export Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'issues' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Action Tracker & Grievance SLA ({monevIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('indicators')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'indicators' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Indicator Library & KPI ({monevIndicators.length})
          </button>
          <button
            onClick={() => setActiveTab('oecd')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'oecd' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Evaluasi OECD-DAC & Closed-Loop ({lessonsLearned.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {policy.canExportReports && (
            <button
              onClick={handleExportGriReport}
              className="px-3.5 py-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold inline-flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Laporan TJSL / GRI (.xlsx)</span>
            </button>
          )}
          {policy.canManageMonevIssues && (
            <button
              onClick={() => setIsAddIssueOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Temuan / Aduan</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: ACTION TRACKER & GRIEVANCE */}
      {activeTab === 'issues' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Action Tracker Temuan Monev Lapangan & Pengaduan Warga (Grievance SLA)</h3>
            <p className="text-slate-500">Klik koordinat Geotag untuk membuka langsung titik inspeksi di Google Maps</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Tiket & Sumber</th>
                  <th className="py-3 px-4">Program & Lokasi</th>
                  <th className="py-3 px-4">Kategori & Temuan</th>
                  <th className="py-3 px-4">Koordinat Geotag</th>
                  <th className="py-3 px-4">PIC & Batas SLA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monevIssues.slice((issPage - 1) * issPageSize, issPage * issPageSize).map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedIssueId(iss.id)}
                        className="font-mono font-bold text-sky-800 hover:underline text-left block"
                      >
                        {iss.ticketNo}
                      </button>
                      <div className="text-slate-500">{iss.source}</div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedIssueId(iss.id)}
                        className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                      >
                        {iss.programTitle}
                      </button>
                      <div className="text-slate-500">{iss.location}</div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <span className="font-semibold text-slate-800 block">{iss.category}</span>
                      <p className="text-slate-600">{iss.description}</p>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(iss.geotagCoord)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 hover:border-rose-300 transition-all shadow-2xs group"
                        title="Buka titik koordinat di Google Maps"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="font-semibold underline decoration-slate-300 group-hover:decoration-rose-400">
                          {iss.geotagCoord}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 ml-0.5" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{iss.pic}</div>
                      <div className="text-amber-700 font-semibold">
                        {iss.deadline} ({iss.slaDaysRemaining > 0 ? `Sisa ${iss.slaDaysRemaining} hari` : 'Selesai'})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold border ${
                          iss.status === 'Selesai Verifikasi'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {iss.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedIssueId(iss.id)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detail</span>
                        </button>
                        {iss.status !== 'Selesai Verifikasi' ? (
                          policy.canManageMonevIssues ? (
                            <button
                              onClick={() =>
                                updateMonevIssueStatus(
                                  iss.id,
                                  iss.status === 'Dalam Investigasi' ? 'Dalam Perbaikan' : 'Selesai Verifikasi'
                                )
                              }
                              className="px-3 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                            >
                              {iss.status === 'Dalam Investigasi' ? 'Mulai Perbaikan' : 'Selesaikan & Verifikasi'}
                            </button>
                          ) : null
                        ) : (
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Terverifikasi
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            totalItems={monevIssues.length}
            currentPage={issPage}
            pageSize={issPageSize}
            onPageChange={setIssPage}
            onPageSizeChange={setIssPageSize}
          />
        </div>
      )}

      {/* TAB 2: INDICATOR LIBRARY */}
      {activeTab === 'indicators' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-sky-700" />
            <div>
              <h3 className="font-bold text-slate-900">Kerangka M&E Terpadu & Indicator Library (M-01 / M-02)</h3>
              <p className="text-slate-500">Pemantauan capaian indikator kinerja terhadap baseline, target, frekuensi, dan status RAG</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Kode & Program</th>
                  <th className="py-3 px-4">Indikator Kinerja</th>
                  <th className="py-3 px-4">Baseline & Target</th>
                  <th className="py-3 px-4">Aktual & Capaian</th>
                  <th className="py-3 px-4">Frekuensi & PIC</th>
                  <th className="py-3 px-4 text-center">RAG</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monevIndicators.slice((indPage - 1) * indPageSize, indPage * indPageSize).map((ind) => (
                  <tr key={ind.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedIndicatorId(ind.id)}
                        className="font-mono font-bold text-sky-800 hover:underline text-left block"
                      >
                        {ind.code}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedIndicatorId(ind.id)}
                        className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                      >
                        {ind.programName}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{ind.indicatorName}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-500">Baseline: {ind.baseline}</div>
                      <div className="font-semibold text-slate-900">Target: {ind.target}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-sky-800">Aktual: {ind.actual} ({ind.achievementPercent}%)</div>
                      <div className="w-32 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ind.ragStatus === 'Hijau' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, ind.achievementPercent)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{ind.frequency}</div>
                      <div className="text-slate-500">{ind.pic}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-semibold border ${
                          ind.ragStatus === 'Hijau'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {ind.ragStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedIndicatorId(ind.id)}
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
          <PaginationBar
            totalItems={monevIndicators.length}
            currentPage={indPage}
            pageSize={indPageSize}
            onPageChange={setIndPage}
            onPageSizeChange={setIndPageSize}
          />
        </div>
      )}

      {/* TAB 3: OECD-DAC & CLOSED LOOP LEARNING */}
      {activeTab === 'oecd' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">Evaluasi Dampak Standar OECD-DAC (M-05)</h3>
            <p className="text-slate-500 mb-4">Skor 6 dimensi evaluasi dampak pada program unggulan (0–100)</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="74%" data={oecdChartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimensi" tick={{ fill: '#334155', fontSize: 14, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 14 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} / 100`, 'Skor OECD-DAC']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      borderColor: '#334155',
                      borderRadius: '10px',
                      fontSize: '14px'
                    }}
                    itemStyle={{ color: '#a5b4fc', fontWeight: 600 }}
                  />
                  <Radar
                    name="Skor Evaluasi"
                    dataKey="skor"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fill="#6366f1"
                    fillOpacity={0.28}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
              {oecdChartData.map((d) => (
                <div key={d.dimensi} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{d.dimensi}</span>
                  <span className="font-bold text-indigo-700">{d.skor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Lessons Learned & Rekomendasi Closed-Loop (M-08 &rarr; P-01)</h3>
              <p className="text-slate-500">Teruskan temuan evaluasi langsung menjadi bahan Draft RKAP tahun berikutnya</p>
            </div>

            <div className="space-y-3">
              {lessonsLearned.map((ls) => (
                <div key={ls.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{ls.sourceProgram} ({ls.year})</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold">{ls.pillar}</span>
                  </div>
                  <p className="text-slate-700"><strong>Temuan:</strong> {ls.finding}</p>
                  <p className="text-sky-900"><strong>Rekomendasi:</strong> {ls.recommendation}</p>
                  <div className="pt-2 flex justify-end">
                    {ls.appliedToRkap ? (
                      <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        ✓ Sudah Masuk Perencanaan RKAP
                      </span>
                    ) : activeJourney === 'rkap' && policy.canApplyClosedLoop ? (
                      <button
                        onClick={() => applyLessonToRkap(ls.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-semibold inline-flex items-center gap-1.5"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        <span>Konversi ke Draft RKAP (Closed-Loop)</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        {activeJourney === 'rkap'
                          ? 'Menunggu Bidang Perencanaan / Monev'
                          : 'Tersimpan sebagai Rekomendasi Evaluasi'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detail Tiket Monev / Grievance */}
      <Modal
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssueId(null)}
        title={`Detail Tiket Monev & Grievance — ${selectedIssue?.ticketNo || ''}`}
        maxWidth="max-w-3xl"
        footer={
          selectedIssue && (
            <>
              <button
                onClick={() => setSelectedIssueId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Tutup
              </button>
              {policy.canManageMonevIssues && selectedIssue.status !== 'Selesai Verifikasi' && (
                <button
                  onClick={() =>
                    updateMonevIssueStatus(
                      selectedIssue.id,
                      selectedIssue.status === 'Dalam Investigasi' ? 'Dalam Perbaikan' : 'Selesai Verifikasi'
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                >
                  {selectedIssue.status === 'Dalam Investigasi' ? 'Mulai Perbaikan' : 'Selesaikan & Verifikasi'}
                </button>
              )}
            </>
          )
        }
      >
        {selectedIssue && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {selectedIssue.ticketNo}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {selectedIssue.source}
              </span>
              <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
                {selectedIssue.category}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  selectedIssue.status === 'Selesai Verifikasi'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {selectedIssue.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Program / Objek Inspeksi:</span>
                <div className="text-base font-bold text-slate-900">{selectedIssue.programTitle}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Lokasi & Koordinat Geotag:</span>
                <div className="font-semibold text-slate-800">{selectedIssue.location}</div>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(selectedIssue.geotagCoord)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded font-mono border border-slate-200"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{selectedIssue.geotagCoord}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">PIC Penanggung Jawab:</span>
                <div className="font-semibold text-slate-900">{selectedIssue.pic}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Batas Waktu & SLA:</span>
                <div className="font-bold text-amber-700">
                  {selectedIssue.deadline} ({selectedIssue.slaDaysRemaining > 0 ? `Sisa ${selectedIssue.slaDaysRemaining} hari` : 'Selesai / Terpenuhi'})
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Uraian Temuan Lapangan / Pengaduan Warga:</div>
              <p className="text-slate-700 leading-relaxed">{selectedIssue.description}</p>
            </div>

            {selectedIssue.recommendation && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <strong>Rekomendasi Tindakan Korektif:</strong>
                <p className="mt-1">{selectedIssue.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Detail Indikator KPI */}
      <Modal
        isOpen={Boolean(selectedIndicator)}
        onClose={() => setSelectedIndicatorId(null)}
        title={`Detail Indikator Kinerja KPI — ${selectedIndicator?.code || ''}`}
        maxWidth="max-w-2xl"
        footer={
          <button
            onClick={() => setSelectedIndicatorId(null)}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
          >
            Tutup
          </button>
        }
      >
        {selectedIndicator && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {selectedIndicator.code}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Frekuensi: {selectedIndicator.frequency}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  selectedIndicator.ragStatus === 'Hijau'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedIndicator.ragStatus === 'Kuning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                RAG: {selectedIndicator.ragStatus}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div>
                <span className="text-slate-500 font-semibold block">Nama Program:</span>
                <div className="text-base font-bold text-slate-900">{selectedIndicator.programName}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Indikator Kinerja Utama (KPI):</span>
                <div className="font-semibold text-slate-800">{selectedIndicator.indicatorName}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block">Satuan Pengukuran:</span>
                  <div className="font-semibold text-slate-800">{selectedIndicator.unit}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">PIC Pelaporan:</span>
                  <div className="font-semibold text-slate-800">{selectedIndicator.pic}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-slate-500 block">Baseline</span>
                <div className="font-bold text-slate-900 mt-0.5">{selectedIndicator.baseline}</div>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center">
                <span className="text-sky-800 block">Target</span>
                <div className="font-bold text-sky-900 mt-0.5">{selectedIndicator.target}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-emerald-800 block">Realisasi Aktual</span>
                <div className="font-bold text-emerald-900 mt-0.5">{selectedIndicator.actual}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800">Persentase Capaian Terhadap Target</span>
                <span className="text-lg font-extrabold text-sky-800">{selectedIndicator.achievementPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${selectedIndicator.ragStatus === 'Hijau' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, selectedIndicator.achievementPercent)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Catat Temuan / Aduan Masyarakat */}
      <Modal
        isOpen={isAddIssueOpen}
        onClose={() => setIsAddIssueOpen(false)}
        title="Catat Temuan Monev Lapangan / Aduan Masyarakat (Grievance)"
      >
        <form onSubmit={handleAddIssue} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Program / Objek Lokasi</label>
              <input type="text" required value={issProgram} onChange={(e) => setIssProgram(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lokasi</label>
              <input type="text" required value={issLoc} onChange={(e) => setIssLoc(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sumber Tiket</label>
              <select value={issSource} onChange={(e) => setIssSource(e.target.value as MonevIssue['source'])} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                <option value="Monev Lapangan">Monev Lapangan (Mobile)</option>
                <option value="Grievance Masyarakat">Grievance / Aduan Masyarakat</option>
                <option value="Survei Penerima">Survei Kepuasan Penerima</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
              <select value={issCategory} onChange={(e) => setIssCategory(e.target.value as MonevIssue['category'])} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                <option value="Keluhan Warga (Grievance)">Keluhan Warga (Grievance)</option>
                <option value="Deviasi Fisik">Deviasi Fisik</option>
                <option value="Keterlambatan Anggaran">Keterlambatan Anggaran</option>
                <option value="Kualitas Mutu">Kualitas Mutu</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Koordinat Geotag (Lat, Lng)</label>
              <input type="text" value={issCoord} onChange={(e) => setIssCoord(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">PIC Penanggung Jawab</label>
              <input type="text" value={issPic} onChange={(e) => setIssPic(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Deskripsi Temuan / Keluhan *</label>
            <textarea required rows={3} value={issDesc} onChange={(e) => setIssDesc(e.target.value)} placeholder="Uraikan kondisi temuan lapangan atau masukan warga..." className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddIssueOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 font-semibold">Batal</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold">Simpan Tiket Monev</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
