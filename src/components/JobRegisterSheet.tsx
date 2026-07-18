/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { JobRegister, Siswa, ProgramStudi, JobLocationType, JobStatus } from "../types";
import { Plus, Search, Trash2, Ship, Building, Briefcase, Globe } from "lucide-react";

interface JobRegisterSheetProps {
  jobs: JobRegister[];
  siswa: Siswa[];
  onAddJobRegister: (newJob: JobRegister) => void;
  onUpdateJobRegister: (updatedJob: JobRegister) => void;
  onDeleteJobRegister: (id: string) => void;
}

export default function JobRegisterSheet({
  jobs,
  siswa,
  onAddJobRegister,
  onUpdateJobRegister,
  onDeleteJobRegister
}: JobRegisterSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSiswaId, setSelectedSiswaId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [positionName, setPositionName] = useState("");
  const [locationType, setLocationType] = useState<JobLocationType>(JobLocationType.LuarNegeri);
  const [countryCity, setCountryCity] = useState("Miami, USA");
  const [salaryEstimate, setSalaryEstimate] = useState("USD 1,500 / month");
  const [regDate, setRegDate] = useState(new Date().toISOString().split("T")[0]);
  const [jobStatus, setJobStatus] = useState<JobStatus>(JobStatus.Daftar);

  // Filter
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.siswaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.namaPerusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.posisi.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = filterLocation === "All" || j.lokasiTipe === filterLocation;
    const matchesStatus = filterStatus === "All" || j.status === filterStatus;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId || !companyName || !positionName) {
      alert("Nama Siswa, Perusahaan, dan Posisi wajib diisi!");
      return;
    }

    const targetSiswa = siswa.find(s => s.id === selectedSiswaId);
    if (!targetSiswa) return;

    const newRecord: JobRegister = {
      id: `JOB-${Date.now().toString().slice(-4)}`,
      siswaId: selectedSiswaId,
      siswaNama: targetSiswa.nama,
      programStudi: targetSiswa.programStudi,
      namaPerusahaan: companyName,
      posisi: positionName,
      lokasiTipe: locationType,
      negaraKota: countryCity,
      gajiPerkiraan: salaryEstimate,
      tanggalDaftar: regDate,
      status: jobStatus
    };

    onAddJobRegister(newRecord);
    setIsFormOpen(false);

    // Reset
    setSelectedSiswaId("");
    setCompanyName("");
    setPositionName("");
  };

  const handleDirectStatusChange = (jobRecord: JobRegister, nextStatus: JobStatus) => {
    onUpdateJobRegister({
      ...jobRecord,
      status: nextStatus
    });
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800" id="job-sheet-container">
      {/* Quick placement stats */}
      <div className="bg-sky-50 border-b border-gray-200 p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white border border-sky-200 p-2 rounded shadow-sm">
          <span className="text-[9px] font-bold text-sky-800 uppercase block">Karir Luar Negeri (Kapal Pesiar/Hotel)</span>
          <span className="text-sm font-bold font-mono block text-gray-950">
            {jobs.filter(j => j.lokasiTipe === JobLocationType.LuarNegeri).length} Pendaftar
          </span>
        </div>
        <div className="bg-white border border-blue-200 p-2 rounded shadow-sm">
          <span className="text-[9px] font-bold text-blue-800 uppercase block">Karir Dalam Negeri (Hotel Nasional)</span>
          <span className="text-sm font-bold font-mono block text-gray-950">
            {jobs.filter(j => j.lokasiTipe === JobLocationType.DalamNegeri).length} Pendaftar
          </span>
        </div>
        <div className="bg-white border border-emerald-200 p-2 rounded shadow-sm">
          <span className="text-[9px] font-bold text-emerald-800 uppercase block">Total Sukses Placed (Lolos & Berangkat)</span>
          <span className="text-sm font-bold font-mono block text-green-700">
            {jobs.filter(j => j.status === JobStatus.Lolos || j.status === JobStatus.Berangkat).length} Siswa
          </span>
        </div>
        <div className="flex items-center justify-end">
          <button
            id="btn-add-job-reg"
            onClick={() => setIsFormOpen(true)}
            className="bg-sky-800 hover:bg-sky-950 text-white text-xs px-3 py-2 rounded font-bold shadow-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Siswa ke Lowongan</span>
          </button>
        </div>
      </div>

      {/* Excel Ribbon */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectedRowId && (
            <button
              id="btn-delete-job"
              onClick={() => {
                if (confirm("Hapus baris pendaftaran kerja ini?")) {
                  onDeleteJobRegister(selectedRowId);
                  setSelectedRowId(null);
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded border border-red-200 font-semibold"
            >
              Hapus Baris Terpilih
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa, perusahaan, posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-48 focus:outline-none bg-white"
            />
          </div>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none bg-white"
          >
            <option value="All">Semua Lokasi</option>
            <option value={JobLocationType.DalamNegeri}>Dalam Negeri</option>
            <option value={JobLocationType.LuarNegeri}>Luar Negeri (Internasional/Kapal)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded text-xs px-2 py-1.5 focus:outline-none bg-white"
          >
            <option value="All">Semua Status Karir</option>
            {Object.values(JobStatus).map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center space-x-2 text-xs font-mono text-gray-600">
        <div className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-bold text-gray-700 min-w-[50px] text-center">
          {selectedRowId ? `JOB-${jobs.findIndex(j => j.id === selectedRowId) + 1}` : "A1"}
        </div>
        <div className="text-gray-400 font-bold">fx</div>
        <div className="border border-gray-300 px-2 py-0.5 rounded flex-grow bg-gray-50 truncate min-h-[22px]">
          {selectedRowId 
            ? `=JOB_FUNNEL(STUDENT: "${jobs.find(j => j.id === selectedRowId)?.siswaNama}", COMPANY: "${jobs.find(j => j.id === selectedRowId)?.namaPerusahaan}", POSITION: "${jobs.find(j => j.id === selectedRowId)?.posisi}", LOC: "${jobs.find(j => j.id === selectedRowId)?.lokasiTipe}", STATUS: "${jobs.find(j => j.id === selectedRowId)?.status}")`
            : "Formula Bar: Formula merekam progress rekrutmen alumni dan siswa LPK Nandita di jaringan hotel & kapal pesiar mitra."
          }
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="flex-grow overflow-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-mono text-gray-500">
              <th className="w-10 text-center border-r border-gray-300 select-none py-1">#</th>
              <th className="px-3 py-1 border-r border-gray-300 w-32">ID Daftar</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Siswa (A)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36">Asal Program Studi (B)</th>
              <th className="px-3 py-1 border-r border-gray-300">Nama Perusahaan / Kapal (C)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-44">Posisi Dilamar (D)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36">Tipe Lokasi (E)</th>
              <th className="px-3 py-1 border-r border-gray-300">Negara/Kota (F)</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36 text-right">Gaji Estimasi</th>
              <th className="px-3 py-1 border-r border-gray-300 w-36 text-center">Status Perekrutan (G)</th>
              <th className="px-3 py-1 text-center w-28">Tanggal Daftar</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono text-gray-700">
            {filteredJobs.map((job, index) => {
              const isSelected = selectedRowId === job.id;
              return (
                <tr
                  key={job.id}
                  onClick={() => setSelectedRowId(job.id)}
                  className={`border-b border-gray-200 cursor-pointer select-none hover:bg-sky-50/20 ${
                    isSelected ? "bg-sky-100/60 border-2 border-sky-600" : ""
                  }`}
                >
                  <td className="w-10 text-center bg-gray-50 border-r border-gray-300 text-[10px] text-gray-400 py-2.5">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-bold">
                    {job.id}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-gray-950">
                    {job.siswaNama}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-sans">
                    {job.programStudi}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-medium text-sky-950 flex items-center">
                    {job.lokasiTipe === JobLocationType.LuarNegeri ? (
                      <Ship className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                    ) : (
                      <Building className="w-3.5 h-3.5 text-teal-600 mr-1.5 flex-shrink-0" />
                    )}
                    {job.namaPerusahaan}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 font-sans font-semibold text-gray-800">
                    {job.posisi}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.lokasiTipe === JobLocationType.LuarNegeri ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {job.lokasiTipe}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-500 font-sans">
                    {job.negaraKota}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-right font-mono text-gray-700">
                    {job.gajiPerkiraan}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    {/* Interactive Dropdown in table cell, typical for advanced spreadsheets */}
                    <select
                      value={job.status}
                      onChange={(e) => handleDirectStatusChange(job, e.target.value as JobStatus)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border focus:outline-none ${
                        job.status === JobStatus.Berangkat ? "bg-indigo-600 text-white border-indigo-700" :
                        job.status === JobStatus.Lolos ? "bg-green-100 text-green-800 border-green-300" :
                        job.status === JobStatus.Interview ? "bg-amber-100 text-amber-800 border-amber-300" :
                        job.status === JobStatus.Daftar ? "bg-gray-100 text-gray-800 border-gray-300" :
                        "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      {Object.values(JobStatus).map(s => (
                        <option key={s} value={s} className="bg-white text-gray-800">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center text-gray-500">
                    {job.tanggalDaftar}
                  </td>
                </tr>
              );
            })}
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-10 text-gray-400 bg-gray-50">
                  Tidak ada baris data pendaftaran karir siswa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500">
        <div>Total Lowongan Karir Aktif: {filteredJobs.length} Pendaftaran</div>
        <div>LPK Nandita Career Center & Placement Registry</div>
      </div>

      {/* Add Job Pendaftaran Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-4 border-b border-gray-200 bg-sky-800 text-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold text-sm">Daftarkan Karir & Penempatan Siswa</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white">✕</button>
            </div>
            
            <form onSubmit={handleSaveForm} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={selectedSiswaId}
                  onChange={(e) => setSelectedSiswaId(e.target.value)}
                  className="w-full border border-gray-300 bg-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswa.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nis} - {s.programStudi})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Perusahaan Penerima / Kapal Pesiar *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Royal Caribbean Cruises, Hilton Hotel Bali"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Posisi / Jabatan Pekerjaan *</label>
                <input
                  type="text"
                  required
                  value={positionName}
                  onChange={(e) => setPositionName(e.target.value)}
                  placeholder="e.g. Assistant Cook, Cabin Steward, Bartender"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Lokasi</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as JobLocationType)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    {Object.values(JobLocationType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status Karir Awal</label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value as JobStatus)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    {Object.values(JobStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Negara / Kota Penempatan</label>
                  <input
                    type="text"
                    value={countryCity}
                    onChange={(e) => setCountryCity(e.target.value)}
                    placeholder="e.g. Miami, Florida - USA"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimasi Gaji / Upah</label>
                  <input
                    type="text"
                    value={salaryEstimate}
                    onChange={(e) => setSalaryEstimate(e.target.value)}
                    placeholder="e.g. USD 1,500 / month"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Pendaftaran Lowongan</label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-sky-800 text-white rounded hover:bg-sky-900 font-semibold"
                >
                  Daftarkan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
