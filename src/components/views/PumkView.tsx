import React, { useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Plus,
  Upload,
  BellRing,
  RefreshCw,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Building2,
  ShoppingBag,
  Search,
  Eye
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ImportDataModal } from '../common/ImportDataModal';
import { PaginationBar } from '../common/PaginationBar';
import { useAppState } from '../../context/AppStateContext';

export const PumkView: React.FC = () => {
  const {
    pumkNplTrendData,
    pumkLoans,
    pumkApplications,
    cooperatives,
    umkCatalog,
    submitPumkApplication,
    advancePumkApplication,
    payPumkInstallment,
    assignPumkCollection,
    restructurePumkLoan
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'onboarding' | 'koperasi'>('portfolio');
  const [loanSearch, setLoanSearch] = useState('');
  const [loanColFilter, setLoanColFilter] = useState('Semua');
  const [loanPage, setLoanPage] = useState(1);
  const [loanPageSize, setLoanPageSize] = useState(5);
  const [appPage, setAppPage] = useState(1);
  const [appPageSize, setAppPageSize] = useState(5);
  const [kopPage, setKopPage] = useState(1);
  const [kopPageSize, setKopPageSize] = useState(5);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedKopId, setSelectedKopId] = useState<string | null>(null);
  const [isAddAppOpen, setIsAddAppOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const selectedLoan = selectedLoanId ? pumkLoans.find((l) => l.id === selectedLoanId) || null : null;
  const selectedApp = selectedAppId ? pumkApplications.find((a) => a.id === selectedAppId) || null : null;
  const selectedKop = selectedKopId ? cooperatives.find((k) => k.id === selectedKopId) || null : null;

  // Onboarding 5C form state
  const [appName, setAppName] = useState('');
  const [bizName, setBizName] = useState('');
  const [appNik, setAppNik] = useState('');
  const [appNib, setAppNib] = useState('NIB-0220109981234');
  const [bizType, setBizType] = useState('Kuliner Olahan Ikan');
  const [appLoc, setAppLoc] = useState('Muntok, Bangka Barat');
  const [reqPlafon, setReqPlafon] = useState(40000000);
  const [tenor, setTenor] = useState(24);
  const [fiveC, setFiveC] = useState({ character: 85, capacity: 80, capital: 75, condition: 82, collateral: 78 });

  const computedCreditScore = Number(
    (fiveC.character * 0.25 + fiveC.capacity * 0.25 + fiveC.capital * 0.20 + fiveC.condition * 0.15 + fiveC.collateral * 0.15).toFixed(1)
  );
  const recommendedPlafon = computedCreditScore >= 80 ? reqPlafon : Math.round(reqPlafon * 0.8);

  const totalRemaining = pumkLoans.reduce((acc, l) => acc + l.remainingPrincipal, 0);
  const nplAmount = pumkLoans.filter((l) => l.dpd > 90).reduce((acc, l) => acc + l.remainingPrincipal, 0);
  const nplPct = totalRemaining > 0 ? ((nplAmount / totalRemaining) * 100).toFixed(2) : '0.00';
  const watchlistCount = pumkLoans.filter((l) => l.dpd > 0).length;

  const handleSubmitApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !bizName.trim() || appNik.replace(/\D/g, '').length !== 16) return;
    submitPumkApplication({
      applicantName: appName.trim(),
      businessName: bizName.trim(),
      nik: appNik.replace(/\D/g, ''),
      nibOrAhu: appNib,
      businessType: bizType,
      location: appLoc,
      geotagCoord: '-2.0642, 105.1614',
      requestedPlafon: Number(reqPlafon),
      tenorMonths: Number(tenor),
      fiveC,
      creditScore: computedCreditScore,
      recommendedPlafon,
      fieldSurveyDone: false
    });
    setAppName('');
    setBizName('');
    setAppNik('');
    setIsAddAppOpen(false);
    setActiveTab('onboarding');
  };

  return (
    <div className="space-y-6">
      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="font-bold uppercase tracking-wider text-slate-500">Total Baki Debet Aktif</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">Rp {(totalRemaining / 1000000).toLocaleString('id-ID')} Jt</div>
          <span className="text-slate-500 mt-1 block">{pumkLoans.length} Mitra Binaan Aktif</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="font-bold uppercase tracking-wider text-emerald-600">Rasio NPL (&gt; 90 Hari)</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{nplPct}%</div>
          <span className="text-emerald-700 mt-1 block">Rekonsiliasi Harian via VA Bank</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="font-bold uppercase tracking-wider text-sky-600">Antrean Onboarding 5C</span>
          <div className="text-2xl font-bold text-sky-700 mt-1">{pumkApplications.filter((a) => a.status !== 'Disetujui & Cair').length} Pengajuan</div>
          <span className="text-slate-500 mt-1 block">Analisis 5C & Credit Scoring</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="font-bold uppercase tracking-wider text-amber-600">Debitur Watchlist (DPD &gt; 0)</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{watchlistCount} Debitur</div>
          <span className="text-slate-500 mt-1 block">Early Warning & Field Collection</span>
        </div>
      </div>

      {/* Tabs & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'portfolio' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Portofolio Pinjaman & Kolektibilitas ({pumkLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'onboarding' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Onboarding & Analisis 5C ({pumkApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('koperasi')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'koperasi' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Kesehatan Koperasi & E-Katalog UMK ({cooperatives.length})
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-900 font-semibold inline-flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Import Portofolio MCOS / PDC</span>
          </button>
          <button
            onClick={() => setIsAddAppOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Pengajuan PUMK (5C)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PORTFOLIO & COLLECTION */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Tren Rasio Kredit Macet (NPL) & Tingkat Kolektibilitas Angsuran</h3>
                <p className="text-slate-500">Monitoring efektivitas penagihan otomatis & early warning pinjaman bermasalah</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span> NPL (%)
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-full bg-sky-500"></span> Collection Rate (%)
                </span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={pumkNplTrendData} margin={{ top: 14, right: 16, left: -4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pumkColGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={14} tickLine={false} axisLine={false} dy={6} />
                  <YAxis yAxisId="left" stroke="#059669" fontSize={14} tickLine={false} axisLine={false} unit="%" domain={[0, 6]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#0284c7" fontSize={14} tickLine={false} axisLine={false} unit="%" domain={[85, 100]} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val}%`,
                      name === 'npl' ? 'Rasio NPL' : 'Collection Rate'
                    ]}
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
                  <ReferenceLine
                    yAxisId="left"
                    y={5}
                    stroke="#f43f5e"
                    strokeDasharray="5 5"
                    label={{ value: 'Batas Aman NPL 5%', position: 'insideTopLeft', fill: '#e11d48', fontSize: 14, fontWeight: 600 }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="collectionRate"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pumkColGrad)"
                    dot={{ r: 4, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2.5 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="npl"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#059669', stroke: '#ffffff', strokeWidth: 2.5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900">Daftar Pinjaman Kemitraan PUMK, Virtual Account & Collection Workflow</h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={loanSearch}
                    onChange={(e) => { setLoanSearch(e.target.value); setLoanPage(1); }}
                    placeholder="Cari akad, VA, nama UMK..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
                  />
                </div>
                <select
                  value={loanColFilter}
                  onChange={(e) => { setLoanColFilter(e.target.value); setLoanPage(1); }}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-slate-700"
                >
                  <option value="Semua">Semua Kolektibilitas</option>
                  <option value="Lancar">Lancar</option>
                  <option value="Pemantauan">Pemantauan</option>
                  <option value="Kurang Lancar">Kurang Lancar</option>
                  <option value="Diragukan">Diragukan</option>
                </select>
              </div>
            </div>
            {(() => {
              const filteredLoans = pumkLoans.filter((l) => {
                const matchCol = loanColFilter === 'Semua' || l.collectibility === loanColFilter;
                const q = loanSearch.toLowerCase();
                const matchQ =
                  !q ||
                  l.borrowerName.toLowerCase().includes(q) ||
                  l.contractNo.toLowerCase().includes(q) ||
                  l.vaNumber.includes(q);
                return matchCol && matchQ;
              });
              const pageLoans = filteredLoans.slice((loanPage - 1) * loanPageSize, loanPage * loanPageSize);
              return (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                          <th className="py-3 px-4">Akad & Virtual Account</th>
                          <th className="py-3 px-4">Mitra Binaan (UMK)</th>
                          <th className="py-3 px-4">Plafon & Sisa Pokok</th>
                          <th className="py-3 px-4 text-center">DPD</th>
                          <th className="py-3 px-4">Kolektibilitas & Graduasi</th>
                          <th className="py-3 px-4 text-right">Aksi Pinjaman</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pageLoans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => setSelectedLoanId(loan.id)}
                                className="font-semibold text-sky-800 hover:underline font-mono text-left block"
                              >
                                {loan.contractNo}
                              </button>
                              <div className="text-slate-500 font-mono">VA: {loan.vaNumber}</div>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => setSelectedLoanId(loan.id)}
                                className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                              >
                                {loan.borrowerName}
                              </button>
                              <div className="text-slate-600">{loan.businessType}</div>
                              {loan.geotagCoord && (
                                <a
                                  href={`https://www.google.com/maps?q=${encodeURIComponent(loan.geotagCoord)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-slate-600 hover:text-rose-700 bg-slate-100 px-2 py-0.5 rounded font-mono"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                  <span>{loan.location || loan.geotagCoord}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-slate-600">Plafon: Rp {(loan.ceiling / 1000000).toLocaleString('id-ID')} Jt</div>
                              <div className="font-bold text-sky-800">Sisa: Rp {(loan.remainingPrincipal / 1000000).toLocaleString('id-ID')} Jt</div>
                              <div className="text-slate-500">Angsuran: Rp {loan.monthlyInstallment.toLocaleString('id-ID')}/bln</div>
                            </td>
                            <td className="py-3 px-4 text-center font-bold">
                              <span className={loan.dpd > 0 ? 'text-amber-600' : 'text-slate-600'}>
                                {loan.dpd} Hari
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold border ${
                                  loan.collectibility === 'Lancar'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : loan.collectibility === 'Pemantauan'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {loan.collectibility}
                              </span>
                              <div className="text-slate-500 mt-1">Tier: <strong>{loan.graduationStatus}</strong></div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedLoanId(loan.id)}
                                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Detail</span>
                                </button>
                                {loan.dpd > 0 && !loan.collectionAssigned && (
                                  <button
                                    onClick={() => assignPumkCollection(loan.id)}
                                    className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold inline-flex items-center gap-1"
                                  >
                                    <BellRing className="w-3.5 h-3.5" />
                                    <span>Tugaskan Collection</span>
                                  </button>
                                )}
                                {loan.dpd > 30 && (
                                  <button
                                    onClick={() => restructurePumkLoan(loan.id)}
                                    className="px-3 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white font-semibold inline-flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Restrukturisasi</span>
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
                    totalItems={filteredLoans.length}
                    currentPage={loanPage}
                    pageSize={loanPageSize}
                    onPageChange={setLoanPage}
                    onPageSizeChange={setLoanPageSize}
                  />
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: ONBOARDING & 5C CREDIT SCORING */}
      {activeTab === 'onboarding' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Onboarding Permohonan Pendanaan PUMK & Analisis Kelayakan 5C (SOP 11.3)</h3>
            <p className="text-slate-500">Alur: Onboarding & OCR &rarr; Survei Lapangan Mobile &rarr; Komite Pendanaan &rarr; Akad e-Sign & Pencairan ke Portofolio Aktif</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">No Registrasi</th>
                  <th className="py-3 px-4">Calon Mitra & Legalitas</th>
                  <th className="py-3 px-4">Pengajuan & Rekomendasi</th>
                  <th className="py-3 px-4">Analisis 5C & Credit Score</th>
                  <th className="py-3 px-4">Tahap SOP</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pumkApplications.slice((appPage - 1) * appPageSize, appPage * appPageSize).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-sky-800">
                      <button
                        type="button"
                        onClick={() => setSelectedAppId(app.id)}
                        className="hover:underline text-left"
                      >
                        {app.regNo}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedAppId(app.id)}
                        className="font-semibold text-slate-900 hover:text-sky-700 hover:underline text-left"
                      >
                        {app.businessName}
                      </button>
                      <div className="text-slate-600">{app.applicantName} &bull; {app.businessType}</div>
                      <div className="font-mono text-slate-500">NIK: {app.nik} &bull; {app.nibOrAhu}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>Ajuan: Rp {app.requestedPlafon.toLocaleString('id-ID')} ({app.tenorMonths} bln)</div>
                      <div className="font-bold text-emerald-700">Rekomendasi: Rp {app.recommendedPlafon.toLocaleString('id-ID')}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">Credit Score: {app.creditScore} / 100</div>
                      <div className="text-slate-500">
                        Ch:{app.fiveC.character} • Ca:{app.fiveC.capacity} • Cp:{app.fiveC.capital} • Cn:{app.fiveC.condition} • Cl:{app.fiveC.collateral}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold border ${
                          app.status === 'Disetujui & Cair'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAppId(app.id)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detail</span>
                        </button>
                        {app.status !== 'Disetujui & Cair' ? (
                          <button
                            onClick={() => advancePumkApplication(app.id)}
                            className="px-3 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                          >
                            {app.status === 'Onboarding'
                              ? 'Kirim Survei Lapangan'
                              : app.status === 'Survei Lapangan'
                              ? 'Ajukan ke Komite'
                              : 'Setujui Akad & Cairkan'}
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Aktif di Portofolio
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
            totalItems={pumkApplications.length}
            currentPage={appPage}
            pageSize={appPageSize}
            onPageChange={setAppPage}
            onPageSizeChange={setAppPageSize}
          />
        </div>
      )}

      {/* TAB 3: KOPERASI & E-KATALOG UMK */}
      {activeTab === 'koperasi' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-700" />
              <div>
                <h3 className="font-bold text-slate-900">Pengembangan & Penilaian Kesehatan Koperasi (K-10)</h3>
                <p className="text-slate-500">Pemantauan tata kelola, kepatuhan RAT, permodalan, SHU, dan digitalisasi pembukuan</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Koperasi & Legalitas AHU</th>
                    <th className="py-3 px-4">Anggota & Modal</th>
                    <th className="py-3 px-4">RAT & Pembukuan Digital</th>
                    <th className="py-3 px-4 text-center">Skor Kesehatan</th>
                    <th className="py-3 px-4">Rencana Penguatan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cooperatives.slice((kopPage - 1) * kopPageSize, kopPage * kopPageSize).map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedKopId(k.id)}
                          className="font-bold text-slate-900 hover:text-sky-700 hover:underline text-left"
                        >
                          {k.name}
                        </button>
                        <div className="font-mono text-slate-500">{k.ahuNo} &bull; {k.location}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{k.memberCount} Anggota</div>
                        <div className="text-slate-600">Modal: Rp {(k.capital / 1000000).toLocaleString('id-ID')} Jt &bull; SHU: Rp {(k.shuLastYear / 1000000).toLocaleString('id-ID')} Jt</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={k.ratCompliant ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                          RAT: {k.ratCompliant ? '✓ Patuh Tepat Waktu' : '✗ Belum RAT'}
                        </div>
                        <div className="text-slate-600">Pembukuan Digital: {k.digitalBookkeeping ? 'Aktif' : 'Manual'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded font-bold border ${
                            k.healthCategory === 'Sehat'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : k.healthCategory === 'Cukup Sehat'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {k.healthScore} ({k.healthCategory})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{k.strengtheningPlan}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedKopId(k.id)}
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
            <PaginationBar totalItems={cooperatives.length} currentPage={kopPage} pageSize={kopPageSize} onPageChange={setKopPage} onPageSizeChange={setKopPageSize} />
          </div>

          {/* E-Katalog UMK & Matchmaking Off-Taker (K-08) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="font-bold text-slate-900">E-Katalog Produk UMK Binaan & Matchmaking Off-Taker (K-08)</h3>
                <p className="text-slate-500">Fasilitasi akses pasar, sertifikasi produk, dan kemitraan penyerap hasil usaha</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {umkCatalog.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">{item.category}</span>
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  <div className="text-slate-600">{item.businessName} &bull; {item.location}</div>
                  <div className="font-semibold text-emerald-700">{item.priceRange}</div>
                  <div className="pt-2 border-t border-slate-200 text-slate-700">
                    <div><strong>Sertifikasi:</strong> {item.certification}</div>
                    <div><strong>Off-Taker:</strong> {item.offTakerMatch}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detail Pinjaman PUMK & Kartu Angsuran VA */}
      <Modal
        isOpen={Boolean(selectedLoan)}
        onClose={() => setSelectedLoanId(null)}
        title={`Detail Pinjaman PUMK & Kartu VA — ${selectedLoan?.contractNo || ''}`}
        maxWidth="max-w-3xl"
        footer={
          selectedLoan && (
            <>
              <button onClick={() => setSelectedLoanId(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold">
                Tutup
              </button>
              {selectedLoan.dpd > 0 && !selectedLoan.collectionAssigned && (
                <button
                  onClick={() => assignPumkCollection(selectedLoan.id)}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold inline-flex items-center gap-1.5"
                >
                  <BellRing className="w-4 h-4" />
                  <span>Tugaskan Collection</span>
                </button>
              )}
              {selectedLoan.dpd > 30 && (
                <button
                  onClick={() => restructurePumkLoan(selectedLoan.id)}
                  className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restrukturisasi</span>
                </button>
              )}
              {selectedLoan.remainingPrincipal > 0 && (
                <button
                  onClick={() => payPumkInstallment(selectedLoan.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Simulasikan Terima Pembayaran Angsuran (VA)
                </button>
              )}
            </>
          )
        }
      >
        {selectedLoan && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {selectedLoan.contractNo}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  selectedLoan.collectibility === 'Lancar'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedLoan.collectibility === 'Pemantauan'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                Kolektibilitas: {selectedLoan.collectibility}
              </span>
              <span className="px-2.5 py-1 rounded font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                DPD: {selectedLoan.dpd} Hari
              </span>
              <span className="px-2.5 py-1 rounded font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                Graduasi: {selectedLoan.graduationStatus}
              </span>
              {selectedLoan.collectionAssigned && (
                <span className="px-2.5 py-1 rounded font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  ✓ Field Collection Ditugaskan
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Mitra Binaan (UMK):</span>
                <div className="text-base font-bold text-slate-900">{selectedLoan.borrowerName}</div>
                <div className="text-slate-600">{selectedLoan.businessType}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nomor Virtual Account & NIK:</span>
                <div className="font-mono font-bold text-sky-800">VA: {selectedLoan.vaNumber}</div>
                {selectedLoan.nik && <div className="font-mono text-slate-600">NIK: {selectedLoan.nik}</div>}
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Plafon & Sisa Baki Debet:</span>
                <div className="text-slate-700">Plafon: Rp {selectedLoan.ceiling.toLocaleString('id-ID')}</div>
                <div className="text-lg font-bold text-sky-900">Sisa: Rp {selectedLoan.remainingPrincipal.toLocaleString('id-ID')}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Angsuran Bulanan & Tenor:</span>
                <div className="font-bold text-emerald-700">
                  Rp {selectedLoan.monthlyInstallment.toLocaleString('id-ID')} / bulan
                </div>
                <div className="text-slate-600">
                  Terbayar {selectedLoan.paidInstallments} dari {selectedLoan.tenorMonths} bulan ({Math.round((selectedLoan.paidInstallments / Math.max(1, selectedLoan.tenorMonths)) * 100)}%)
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((selectedLoan.paidInstallments / Math.max(1, selectedLoan.tenorMonths)) * 100))}%` }}
                  />
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Credit Score & Pembayaran Terakhir:</span>
                <div className="font-bold text-slate-900">Skor: {selectedLoan.creditScore} / 100</div>
                <div className="text-slate-600">Bayar Terakhir: {selectedLoan.lastPaymentDate}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Lokasi Usaha & Geotag:</span>
                {selectedLoan.geotagCoord ? (
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(selectedLoan.geotagCoord)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded font-mono border border-slate-200"
                  >
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{selectedLoan.location || selectedLoan.geotagCoord}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="text-slate-700">{selectedLoan.location || 'Wilayah Operasi PT Timah'}</div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-950">
              Status Graduasi menuju pembiayaan perbankan (KUR): <strong>{selectedLoan.graduationStatus}</strong>. Rekonsiliasi mutasi Virtual Account berjalan otomatis melalui Host-to-Host Perbankan.
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Detail Pengajuan PUMK & Analisis 5C */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedAppId(null)}
        title={`Detail Pengajuan PUMK & Analisis 5C — ${selectedApp?.regNo || ''}`}
        maxWidth="max-w-3xl"
        footer={
          selectedApp && (
            <>
              <button onClick={() => setSelectedAppId(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold">
                Tutup
              </button>
              {selectedApp.status !== 'Disetujui & Cair' && (
                <button
                  onClick={() => advancePumkApplication(selectedApp.id)}
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                >
                  {selectedApp.status === 'Onboarding'
                    ? 'Kirim Survei Lapangan'
                    : selectedApp.status === 'Survei Lapangan'
                    ? 'Ajukan ke Komite'
                    : 'Setujui Akad & Cairkan'}
                </button>
              )}
            </>
          )
        }
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {selectedApp.regNo}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  selectedApp.status === 'Disetujui & Cair'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}
              >
                Tahap SOP: {selectedApp.status}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  selectedApp.fieldSurveyDone
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {selectedApp.fieldSurveyDone ? '✓ Survei Lapangan Selesai' : 'Menunggu Survei Lapangan'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Nama Usaha & Pemohon:</span>
                <div className="text-base font-bold text-slate-900">{selectedApp.businessName}</div>
                <div className="text-slate-700">{selectedApp.applicantName} &bull; {selectedApp.businessType}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Identitas & Legalitas:</span>
                <div className="font-mono text-slate-800">NIK: {selectedApp.nik}</div>
                <div className="font-mono text-slate-600">{selectedApp.nibOrAhu}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Plafon Diajukan & Rekomendasi:</span>
                <div className="text-slate-700">Ajuan: Rp {selectedApp.requestedPlafon.toLocaleString('id-ID')} ({selectedApp.tenorMonths} bln)</div>
                <div className="font-bold text-emerald-700">Rekomendasi: Rp {selectedApp.recommendedPlafon.toLocaleString('id-ID')}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Lokasi & Geotag Usaha:</span>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(selectedApp.geotagCoord)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded font-mono border border-slate-200"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{selectedApp.location} ({selectedApp.geotagCoord})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900">Rincian Analisis Kelayakan 5C</span>
                <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 font-bold">
                  Credit Score: {selectedApp.creditScore} / 100
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: 'Character (25%)', val: selectedApp.fiveC.character },
                  { label: 'Capacity (25%)', val: selectedApp.fiveC.capacity },
                  { label: 'Capital (20%)', val: selectedApp.fiveC.capital },
                  { label: 'Condition (15%)', val: selectedApp.fiveC.condition },
                  { label: 'Collateral (15%)', val: selectedApp.fiveC.collateral }
                ].map((c) => (
                  <div key={c.label} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <div className="text-slate-500">{c.label}</div>
                    <div className="text-lg font-bold text-slate-900">{c.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Detail Kesehatan Koperasi */}
      <Modal
        isOpen={Boolean(selectedKop)}
        onClose={() => setSelectedKopId(null)}
        title={`Detail Koperasi Binaan — ${selectedKop?.code || ''}`}
        maxWidth="max-w-2xl"
        footer={
          <button onClick={() => setSelectedKopId(null)} className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold">
            Tutup
          </button>
        }
      >
        {selectedKop && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                {selectedKop.code}
              </span>
              <span
                className={`px-2.5 py-1 rounded font-bold border ${
                  selectedKop.healthCategory === 'Sehat'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedKop.healthCategory === 'Cukup Sehat'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                Skor {selectedKop.healthScore} ({selectedKop.healthCategory})
              </span>
              <span
                className={`px-2.5 py-1 rounded font-semibold border ${
                  selectedKop.ratCompliant
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {selectedKop.ratCompliant ? '✓ RAT Patuh' : '✗ Belum RAT'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-semibold block">Nama Koperasi:</span>
                <div className="text-base font-bold text-slate-900">{selectedKop.name}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nomor Legalitas AHU:</span>
                <div className="font-mono font-semibold text-slate-800">{selectedKop.ahuNo}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Lokasi / Wilayah:</span>
                <div className="font-semibold text-slate-800">{selectedKop.location}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Jumlah Anggota & Permodalan:</span>
                <div className="font-bold text-slate-900">{selectedKop.memberCount} Anggota</div>
                <div className="text-slate-700">Modal: Rp {selectedKop.capital.toLocaleString('id-ID')}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">SHU Tahun Lalu & Pembukuan:</span>
                <div className="font-bold text-emerald-700">SHU: Rp {selectedKop.shuLastYear.toLocaleString('id-ID')}</div>
                <div className="text-slate-700">Pembukuan Digital: <strong>{selectedKop.digitalBookkeeping ? 'Aktif' : 'Manual'}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-950">
              <strong>Rencana Penguatan & Pendampingan Koperasi:</strong>
              <p className="mt-1">{selectedKop.strengtheningPlan}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Input Pengajuan PUMK + Analisis 5C */}
      <Modal
        isOpen={isAddAppOpen}
        onClose={() => setIsAddAppOpen(false)}
        title="Onboarding Pengajuan PUMK & Simulasi Credit Scoring 5C"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitApp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Pemilik Usaha *</label>
              <input type="text" required value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Contoh: Dewi Kartika" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Usaha / UMK *</label>
              <input type="text" required value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="Contoh: Keripik Ikan Tenggiri Berkah" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">NIK Pemilik (16 Digit) *</label>
              <input type="text" required maxLength={16} value={appNik} onChange={(e) => setAppNik(e.target.value)} placeholder="1905014208850001" className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">NIB / Legalitas Usaha (OSS)</label>
              <input type="text" value={appNib} onChange={(e) => setAppNib(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Plafon Diajukan (Rp)</label>
              <input type="number" required value={reqPlafon} onChange={(e) => setReqPlafon(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tenor (Bulan) & Lokasi</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={tenor} onChange={(e) => setTenor(Number(e.target.value))} className="px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="text" value={appLoc} onChange={(e) => setAppLoc(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900">Analisis Kelayakan 5C (Skor 0–100):</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['character', 'capacity', 'capital', 'condition', 'collateral'] as const).map((k) => (
                <div key={k}>
                  <label className="capitalize font-semibold text-slate-600 block">{k}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={fiveC[k]}
                    onChange={(e) => setFiveC({ ...fiveC, [k]: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-center font-bold"
                  />
                </div>
              ))}
            </div>
            <div className="pt-2 flex flex-wrap justify-between items-center border-t border-slate-200">
              <span>Credit Score Otomatis: <strong className="text-sky-800">{computedCreditScore} / 100</strong></span>
              <span>Rekomendasi Plafon: <strong className="text-emerald-700">Rp {recommendedPlafon.toLocaleString('id-ID')}</strong></span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddAppOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 font-semibold">Batal</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold">Simpan Pengajuan PUMK</button>
          </div>
        </form>
      </Modal>

      <ImportDataModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        defaultType="pumk"
      />
    </div>
  );
};
