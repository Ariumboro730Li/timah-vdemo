import React, { useState } from 'react';
import { RkapItem, SocialMappingRegion, ImportDatasetType } from '../../types';
import {
  Plus,
  Search,
  Eye,
  Compass,
  Upload,
  CheckCircle2,
  ArrowRightCircle,
  MapPin,
  ExternalLink,
  Sliders,
  RefreshCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Modal } from '../common/Modal';
import { ImportDataModal } from '../common/ImportDataModal';
import { PaginationBar } from '../common/PaginationBar';
import { useAppState } from '../../context/AppStateContext';

export const PerencanaanView: React.FC = () => {
  const {
    rkapList,
    socialMapping,
    lessonsLearned,
    addRkapItems,
    advanceRkapStatus,
    convertRkapToProject,
    applyLessonToRkap
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'rkap' | 'social' | 'whatif'>('rkap');
  const [selectedRkapId, setSelectedRkapId] = useState<string | null>(null);
  const [selectedSocial, setSelectedSocial] = useState<SocialMappingRegion | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importType, setImportType] = useState<ImportDatasetType>('rkap');

  const [filterPillar, setFilterPillar] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rkapPage, setRkapPage] = useState(1);
  const [rkapPageSize, setRkapPageSize] = useState(5);
  const [smPage, setSmPage] = useState(1);
  const [smPageSize, setSmPageSize] = useState(5);

  // New RKAP Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPillar, setNewPillar] = useState<RkapItem['pillar']>('Ekonomi');
  const [newLocation, setNewLocation] = useState('Muntok, Bangka Barat');
  const [newRing, setNewRing] = useState<RkapItem['ring']>('Ring 1');
  const [newBudget, setNewBudget] = useState(650000000);
  const [newSdgs, setNewSdgs] = useState('SDG 8, SDG 14');
  const [newKpi, setNewKpi] = useState('Kenaikan pendapatan 30%, 50 penerima mandiri');
  const [newPartner, setNewPartner] = useState('Pemda & Mitra Lokal');

  // What-If Simulation state
  const [simTotalBudget, setSimTotalBudget] = useState(52); // Miliar
  const [simShares, setSimShares] = useState({ ekonomi: 42, lingkungan: 28, sosial: 22, hukum: 8 });

  const filteredList = rkapList.filter((item) => {
    const matchPillar = filterPillar === 'All' || item.pillar === filterPillar;
    const matchQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPillar && matchQuery;
  });

  const selectedRkap = selectedRkapId ? rkapList.find((r) => r.id === selectedRkapId) || null : null;
  const pendingLessons = lessonsLearned.filter((l) => !l.appliedToRkap);

  const handleCreateRkap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const code = `RKA-2026-0${rkapList.length + 10}`;
    const item: RkapItem = {
      id: `rka-${Date.now()}`,
      code,
      title: newTitle.trim(),
      pillar: newPillar,
      sdgs: newSdgs.split(',').map((s) => s.trim()).filter(Boolean),
      location: newLocation,
      ring: newRing,
      budget: Number(newBudget),
      committedBudget: 0,
      realizedBudget: 0,
      priorityScore: 84,
      status: 'Draft',
      version: 'v1.0',
      kpiTarget: newKpi,
      baseline: 'Berdasarkan hasil Social Mapping wilayah operasi',
      synergyPartner: newPartner,
      theoryOfChange: {
        input: `Pagu Rp ${Number(newBudget).toLocaleString('id-ID')} & pendamping teknis`,
        activity: `Pelaksanaan ${newTitle.trim()} bersama ${newPartner}`,
        output: newKpi,
        outcome: 'Peningkatan kapasitas & kesejahteraan masyarakat sasaran',
        impact: 'Pemberdayaan berkelanjutan di wilayah operasi Ring tambang',
        riskSafeguard: 'Pemantauan risiko sosial, lingkungan & kepatuhan tata kelola'
      }
    };
    addRkapItems([item], 'Form RKAP');
    setNewTitle('');
    setIsAddOpen(false);
  };

  const simTotalPct = simShares.ekonomi + simShares.lingkungan + simShares.sosial + simShares.hukum;
  const whatIfChartData = [
    { pilar: 'Ekonomi (PPM/PUMK)', miliar: Number(((simTotalBudget * simShares.ekonomi) / (simTotalPct || 1)).toFixed(2)) },
    { pilar: 'Lingkungan', miliar: Number(((simTotalBudget * simShares.lingkungan) / (simTotalPct || 1)).toFixed(2)) },
    { pilar: 'Sosial & Charity', miliar: Number(((simTotalBudget * simShares.sosial) / (simTotalPct || 1)).toFixed(2)) },
    { pilar: 'Hukum & Tata Kelola', miliar: Number(((simTotalBudget * simShares.hukum) / (simTotalPct || 1)).toFixed(2)) }
  ];

  return (
    <div className="space-y-6">
      {/* Closed-Loop Banner from Monev */}
      {pendingLessons.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <RefreshCcw className="w-5 h-5 text-violet-700 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-violet-950">
                Umpan Balik Closed-Loop dari Evaluasi Monev ({pendingLessons.length} Rekomendasi Baru)
              </div>
              <p className="text-violet-900 mt-0.5">{pendingLessons[0].recommendation}</p>
            </div>
          </div>
          <button
            onClick={() => applyLessonToRkap(pendingLessons[0].id)}
            className="px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-semibold flex-shrink-0"
          >
            Jadikan Draft Program RKAP
          </button>
        </div>
      )}

      {/* Navigation Tabs + Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('rkap')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'rkap' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            RKAP & Roadmap TJSL ({rkapList.length})
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'social' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Social Mapping & Needs Assessment ({socialMapping.length})
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'whatif' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Simulasi What-If Anggaran</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setImportType(activeTab === 'social' ? 'social_mapping' : 'rkap');
              setImportOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-900 font-semibold inline-flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>{activeTab === 'social' ? 'Import BPS / Podes' : 'Import RKAP'}</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Usulkan Program RKAP</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RKAP */}
      {activeTab === 'rkap' && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari program, lokasi, atau kode RKAP..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setRkapPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 font-medium">Pilar:</span>
              <select
                value={filterPillar}
                onChange={(e) => { setFilterPillar(e.target.value); setRkapPage(1); }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 font-semibold outline-none focus:border-sky-500"
              >
                <option value="All">Semua Pilar</option>
                <option value="Ekonomi">Pilar Ekonomi</option>
                <option value="Lingkungan">Pilar Lingkungan</option>
                <option value="Sosial">Pilar Sosial</option>
                <option value="Hukum & Tata Kelola">Pilar Hukum & Tata Kelola</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Kode & Versi</th>
                    <th className="py-3 px-4">Judul Program & KPI</th>
                    <th className="py-3 px-4">Pilar & SDGs</th>
                    <th className="py-3 px-4">Lokasi / Ring</th>
                    <th className="py-3 px-4">Pagu Anggaran</th>
                    <th className="py-3 px-4">Persetujuan Berjenjang</th>
                    <th className="py-3 px-4 text-right">Alur Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.slice((rkapPage - 1) * rkapPageSize, rkapPage * rkapPageSize).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-sky-800">{item.code}</div>
                        <div className="text-slate-400">{item.version}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-slate-500 mt-0.5">KPI: {item.kpiTarget}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">{item.pillar}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.sdgs.map((s, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800">{item.location}</div>
                        <span className="text-sky-700 font-semibold">{item.ring}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        Rp {(item.budget / 1000000).toLocaleString('id-ID')} Jt
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold border ${
                            item.status === 'Disetujui Direksi'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'Draft'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRkapId(item.id)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>

                          {item.status !== 'Disetujui Direksi' ? (
                            <button
                              onClick={() => advanceRkapStatus(item.id)}
                              className="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui (e-Sign)</span>
                            </button>
                          ) : item.convertedToImpl ? (
                            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              ✓ Di Implementasi
                            </span>
                          ) : (
                            <button
                              onClick={() => convertRkapToProject(item.id)}
                              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold inline-flex items-center gap-1"
                            >
                              <ArrowRightCircle className="w-3.5 h-3.5" />
                              <span>Turunkan ke PPM</span>
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
              totalItems={filteredList.length}
              currentPage={rkapPage}
              pageSize={rkapPageSize}
              onPageChange={setRkapPage}
              onPageSizeChange={setRkapPageSize}
            />
          </div>
        </>
      )}

      {/* TAB 2: SOCIAL MAPPING & NEEDS ASSESSMENT */}
      {activeTab === 'social' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900">Peta Kebutuhan Wilayah (Social Mapping & Stakeholder Matrix)</h3>
              <p className="text-slate-500">Data BPS / DTSEN / Podes dan pemetaan kepentingan-pengaruh di sekitar area operasi perusahaan</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Wilayah & Zona</th>
                  <th className="py-3 px-4">Populasi & Kemiskinan</th>
                  <th className="py-3 px-4">Jumlah UMK</th>
                  <th className="py-3 px-4">Kebutuhan Prioritas</th>
                  <th className="py-3 px-4">Pemetaan Stakeholder</th>
                  <th className="py-3 px-4">Sumber & Koordinat</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {socialMapping.slice((smPage - 1) * smPageSize, smPage * smPageSize).map((sm) => (
                  <tr key={sm.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sm.region}</div>
                      <div className="text-slate-600">{sm.district}</div>
                      <span className="text-sky-700 font-semibold">{sm.ring}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{sm.population.toLocaleString('id-ID')} Jiwa</div>
                      <div className="text-amber-700 font-semibold">Kemiskinan: {sm.povertyRate}%</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{sm.umkCount} Unit</td>
                    <td className="py-3 px-4 text-slate-700 max-w-sm">{sm.priorityNeeds}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                        {sm.stakeholderPosition}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-600 mb-1">{sm.dataSource}</div>
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(sm.geotagCoord)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded font-mono border border-slate-200"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{sm.geotagCoord}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSocial(sm)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold inline-flex items-center gap-1"
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
            totalItems={socialMapping.length}
            currentPage={smPage}
            pageSize={smPageSize}
            onPageChange={setSmPage}
            onPageSizeChange={setSmPageSize}
          />
        </div>
      )}

      {/* TAB 3: WHAT-IF BUDGET ALLOCATION SIMULATION */}
      {activeTab === 'whatif' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Simulasi Skenario Alokasi Anggaran RKAP (What-If)</h3>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Total Pagu Anggaran TJSL (Miliar Rp): <strong>Rp {simTotalBudget} M</strong></label>
              <input
                type="range"
                min={20}
                max={100}
                value={simTotalBudget}
                onChange={(e) => setSimTotalBudget(Number(e.target.value))}
                className="w-full accent-sky-700"
              />
            </div>

            {([
              { key: 'ekonomi', label: 'Pilar Ekonomi (PPM & PUMK)' },
              { key: 'lingkungan', label: 'Pilar Lingkungan (Reklamasi)' },
              { key: 'sosial', label: 'Pilar Sosial (Charity & Pendidikan)' },
              { key: 'hukum', label: 'Pilar Hukum & Tata Kelola' }
            ] as const).map((p) => (
              <div key={p.key} className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>{p.label}</span>
                  <span>
                    {simShares[p.key]}% (Rp {((simTotalBudget * simShares[p.key]) / (simTotalPct || 1)).toFixed(2)} M)
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={70}
                  value={simShares[p.key]}
                  onChange={(e) => setSimShares({ ...simShares, [p.key]: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">Proyeksi Distribusi Dana per Pilar (Miliar Rp)</h3>
            <p className="text-slate-500 mb-4">Perubahan bobot otomatis menormalisasi pagu masing-masing pilar</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={whatIfChartData} margin={{ top: 24, right: 16, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="pilar" stroke="#475569" fontSize={14} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={14} tickLine={false} axisLine={false} unit="M" />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(val: any) => [`Rp ${val} Miliar`, 'Alokasi']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      borderColor: '#334155',
                      borderRadius: '10px',
                      fontSize: '14px'
                    }}
                    itemStyle={{ color: '#38bdf8', fontWeight: 600 }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 700 }}
                  />
                  <Bar dataKey="miliar" radius={[8, 8, 0, 0]} barSize={50} background={{ fill: '#f1f5f9', radius: 8 }}>
                    {['#0284c7', '#10b981', '#f59e0b', '#6366f1'].map((color, idx) => (
                      <Cell key={idx} fill={color} />
                    ))}
                    <LabelList
                      dataKey="miliar"
                      position="top"
                      formatter={(v: any) => `Rp ${v}M`}
                      style={{ fill: '#0f172a', fontWeight: 700, fontSize: 14 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detail RKAP & Theory of Change */}
      <Modal
        isOpen={Boolean(selectedRkap)}
        onClose={() => setSelectedRkapId(null)}
        title={`Detail Program RKAP & LogFrame — ${selectedRkap?.code || ''}`}
        maxWidth="max-w-3xl"
        footer={
          selectedRkap && (
            <>
              <button
                type="button"
                onClick={() => setSelectedRkapId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Tutup
              </button>
              {selectedRkap.status !== 'Disetujui Direksi' ? (
                <button
                  type="button"
                  onClick={() => advanceRkapStatus(selectedRkap.id)}
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                >
                  Setujui Berjenjang (e-Sign)
                </button>
              ) : !selectedRkap.convertedToImpl ? (
                <button
                  type="button"
                  onClick={() => convertRkapToProject(selectedRkap.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Turunkan ke Modul Implementasi
                </button>
              ) : null}
            </>
          )
        }
      >
        {selectedRkap && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 uppercase font-semibold block">Program:</span>
                <div className="font-bold text-slate-900">{selectedRkap.title}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold block">Pagu & Mitra Sinergi:</span>
                <div className="font-bold text-sky-800">Rp {selectedRkap.budget.toLocaleString('id-ID')}</div>
                <div className="text-slate-600">{selectedRkap.synergyPartner}</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>Rantai Hasil Theory of Change</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-500 block uppercase">Input</span>
                  <p className="mt-1 text-slate-800">{selectedRkap.theoryOfChange.input}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-500 block uppercase">Aktivitas</span>
                  <p className="mt-1 text-slate-800">{selectedRkap.theoryOfChange.activity}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-sky-700 block uppercase">Output</span>
                  <p className="mt-1 text-slate-800">{selectedRkap.theoryOfChange.output}</p>
                </div>
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <span className="font-bold text-sky-800 block uppercase">Outcome</span>
                  <p className="mt-1 text-slate-900">{selectedRkap.theoryOfChange.outcome}</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-800 block uppercase">Impact (Dampak Jangka Panjang)</span>
                <p className="mt-1 text-emerald-950 font-medium">{selectedRkap.theoryOfChange.impact}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950">
              <span className="font-bold">Risiko & Safeguard:</span> {selectedRkap.theoryOfChange.riskSafeguard}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Detail Social Mapping */}
      <Modal
        isOpen={Boolean(selectedSocial)}
        onClose={() => setSelectedSocial(null)}
        title={`Detail Social Mapping — ${selectedSocial?.district || ''}, ${selectedSocial?.region || ''}`}
        footer={
          <button
            type="button"
            onClick={() => setSelectedSocial(null)}
            className="px-4 py-2 rounded-lg bg-sky-700 text-white font-semibold"
          >
            Tutup
          </button>
        }
      >
        {selectedSocial && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block">Wilayah / Kecamatan</span>
                <strong className="text-slate-900">{selectedSocial.region} — {selectedSocial.district}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Zona Operasi</span>
                <strong className="text-sky-800">{selectedSocial.ring}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Sumber Data</span>
                <strong className="text-slate-900">{selectedSocial.dataSource}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Populasi</span>
                <strong className="text-slate-900">{selectedSocial.population.toLocaleString('id-ID')} Jiwa</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tingkat Kemiskinan</span>
                <strong className="text-amber-700">{selectedSocial.povertyRate}%</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Potensi UMK Lokal</span>
                <strong className="text-slate-900">{selectedSocial.umkCount} Unit Usaha</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-950">
              <strong>Kebutuhan Prioritas Wilayah (Needs Assessment):</strong>
              <p className="mt-1">{selectedSocial.priorityNeeds}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block">Pemetaan Stakeholder</span>
                <strong className="text-indigo-800">{selectedSocial.stakeholderPosition}</strong>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block">Konteks Operasi Perusahaan</span>
                <strong className="text-slate-900">{selectedSocial.productionContext}</strong>
              </div>
            </div>

            <div>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(selectedSocial.geotagCoord)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 font-mono font-semibold border border-slate-200"
              >
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Buka Koordinat di Google Maps ({selectedSocial.geotagCoord})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Tambah Program RKAP */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Usulkan Program Kerja Baru (RKAP TJSL)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateRkap} className="space-y-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Judul Program Kerja *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Contoh: Sentra Pengolahan Rumput Laut Pesisir Kundur"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilar Program</label>
              <select
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value as RkapItem['pillar'])}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Ekonomi">Ekonomi</option>
                <option value="Lingkungan">Lingkungan</option>
                <option value="Sosial">Sosial</option>
                <option value="Hukum & Tata Kelola">Hukum & Tata Kelola</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pagu Anggaran (Rp)</label>
              <input
                type="number"
                required
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lokasi</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Zona Operasi</label>
              <select
                value={newRing}
                onChange={(e) => setNewRing(e.target.value as RkapItem['ring'])}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Ring 1">Ring 1</option>
                <option value="Ring 2">Ring 2</option>
                <option value="Ring 3">Ring 3</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tagging SDGs (pisahkan koma)</label>
              <input
                type="text"
                value={newSdgs}
                onChange={(e) => setNewSdgs(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mitra Sinergi</label>
              <input
                type="text"
                value={newPartner}
                onChange={(e) => setNewPartner(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target KPI Program</label>
            <input
              type="text"
              value={newKpi}
              onChange={(e) => setNewKpi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
            >
              Simpan Draft RKAP
            </button>
          </div>
        </form>
      </Modal>

      <ImportDataModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        defaultType={importType}
      />
    </div>
  );
};
