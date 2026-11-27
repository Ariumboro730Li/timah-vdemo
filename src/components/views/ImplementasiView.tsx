import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { PaginationBar } from '../common/PaginationBar';
import { useAppState } from '../../context/AppStateContext';

export const ImplementasiView: React.FC = () => {
  const {
    projects,
    charities,
    advanceProjectProgress,
    completeProjectBast,
    addCharityItem,
    advanceCharityStatus
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'ppm' | 'charity'>('ppm');
  const [ppmPage, setPpmPage] = useState(1);
  const [ppmPageSize, setPpmPageSize] = useState(5);
  const [chPage, setChPage] = useState(1);
  const [chPageSize, setChPageSize] = useState(5);
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
          <button
            onClick={() => setActiveTab('charity')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'charity' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bantuan TJSL / Charity & Darurat ({charities.length})
          </button>
        </div>

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
      </div>

      {/* TAB 1: PROGRAM PPM */}
      {activeTab === 'ppm' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Pelaksanaan Program Pemberdayaan Masyarakat (PPM)</h3>
            <p className="text-slate-500">
              Terhubung dengan RKAP, Seleksi Proposal, SAP FICO, Absensi QR Lapangan, Geotag, dan otomatis mendaftarkan Aset saat BAST selesai.
            </p>
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
                {projects.slice((ppmPage - 1) * ppmPageSize, ppmPage * ppmPageSize).map((prj) => (
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
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            totalItems={projects.length}
            currentPage={ppmPage}
            pageSize={ppmPageSize}
            onPageChange={setPpmPage}
            onPageSizeChange={setPpmPageSize}
          />
        </div>
      )}

      {/* TAB 2: BANTUAN CHARITY / SOSIAL KEMASYARAKATAN */}
      {activeTab === 'charity' && (
        <div className="space-y-6">
          {/* Sub-limit Pagu per Kategori (C-03) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">Kontrol Sub-Limit Anggaran Bantuan Charity per Kategori</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(Object.keys(subLimits) as CharityItem['category'][]).map((cat) => {
                const used = charities.filter((c) => c.category === cat).reduce((a, b) => a + b.requestedAmount, 0);
                const pct = Math.min(100, Math.round((used / subLimits[cat]) * 100));
                return (
                  <div key={cat} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800">{cat}</div>
                    <div className="text-slate-600 mt-0.5">
                      Rp {(used / 1000000).toFixed(1)} Jt / Rp {subLimits[cat] / 1000000} Jt
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-sky-600 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charity Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Penyaluran Bantuan TJSL / Charity & Jalur Darurat (SOP 11.2)</h3>
              <p className="text-slate-500">Dilengkapi deteksi fraud/anomali, deklarasi bebas benturan kepentingan (COI), dan pencairan langsung (direct to beneficiary)</p>
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
                  {charities.slice((chPage - 1) * chPageSize, chPage * chPageSize).map((c) => (
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
                        <div className="font-mono text-slate-500">NIK: {c.nik}</div>
                        <div className="text-slate-600">{c.accountNo}</div>
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
                          {c.disbursementStatus !== 'BAST Selesai' ? (
                            <button
                              onClick={() => advanceCharityStatus(c.id)}
                              className="px-3 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                            >
                              {c.disbursementStatus === 'Verifikasi'
                                ? 'Loloskan Verifikasi'
                                : c.disbursementStatus === 'Menunggu Persetujuan'
                                ? 'Cairkan (Direct Bank)'
                                : 'Selesaikan BAST'}
                            </button>
                          ) : (
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
              totalItems={charities.length}
              currentPage={chPage}
              pageSize={chPageSize}
              onPageChange={setChPage}
              onPageSizeChange={setChPageSize}
            />
          </div>
        </div>
      )}

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
              {selectedProject.progressPercent < 100 && (
                <button
                  onClick={() => advanceProjectProgress(selectedProject.id)}
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                >
                  Verifikasi Output & Posting Termin SAP
                </button>
              )}
              {!selectedProject.bastSigned && (
                <button
                  onClick={() => completeProjectBast(selectedProject.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tutup LPJ, BAST & Catat Aset</span>
                </button>
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
              {selectedCharity.disbursementStatus !== 'BAST Selesai' && (
                <button
                  onClick={() => advanceCharityStatus(selectedCharity.id)}
                  className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
                >
                  {selectedCharity.disbursementStatus === 'Verifikasi'
                    ? 'Loloskan Verifikasi'
                    : selectedCharity.disbursementStatus === 'Menunggu Persetujuan'
                    ? 'Cairkan (Direct Bank)'
                    : 'Selesaikan BAST'}
                </button>
              )}
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
                <span className="text-slate-500 font-semibold block">NIK Penanggung Jawab (SBR):</span>
                <div className="font-mono font-bold text-slate-800">{selectedCharity.nik}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Rekening Direct-to-Beneficiary:</span>
                <div className="font-semibold text-slate-800">{selectedCharity.accountNo}</div>
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
