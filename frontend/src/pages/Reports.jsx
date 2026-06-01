import React, { useState, useEffect } from 'react';
import { MdDescription, MdDownload, MdDelete, MdAdd, MdRefresh } from 'react-icons/md';
import { PageHeader, Skeleton } from '../components/common/UI';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending: 'badge-warning', generating: 'badge-info', completed: 'badge-success', failed: 'badge-critical' };
const FORMAT_ICONS = { pdf: '📄', csv: '📊', json: '📋' };

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'custom', format: 'pdf',
    dateFrom: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    sections: ['system', 'performance', 'alerts']
  });
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try { const res = await API.get('/reports'); setReports(res.data); }
    catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  // Auto-poll for generating reports
  useEffect(() => {
    const hasGenerating = reports.some(r => r.status === 'generating' || r.status === 'pending');
    if (!hasGenerating) return;
    const t = setInterval(fetchReports, 3000);
    return () => clearInterval(t);
  }, [reports]);

  const generateReport = async () => {
    if (!form.name) return toast.error('Please enter a report name');
    setGenerating(true);
    try {
      await API.post('/reports/generate', {
        name: form.name, type: form.type, format: form.format,
        dateRange: { from: form.dateFrom, to: form.dateTo },
        sections: form.sections
      });
      toast.success('Report generation started');
      setShowForm(false);
      fetchReports();
    } catch { toast.error('Failed to generate report'); }
    finally { setGenerating(false); }
  };

  const downloadReport = async (id, name, format) => {
    try {
      const res = await API.get(`/reports/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${name}.${format}`; a.click();
    } catch { toast.error('Download failed'); }
  };

  const deleteReport = async (id) => {
    try { await API.delete(`/reports/${id}`); setReports(prev => prev.filter(r => r._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const sectionOptions = ['system', 'performance', 'alerts', 'security', 'network', 'storage'];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Report Generator" subtitle="Generate and download system reports" icon={MdDescription}
        actions={<div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 text-sm flex items-center gap-1"><MdAdd size={16} /> New Report</button>
          <button onClick={fetchReports} className="btn-ghost px-3 py-2 text-sm"><MdRefresh size={16} /></button>
        </div>}
      />

      {/* New Report Form */}
      {showForm && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Generate New Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label block mb-2">Report Name</label>
              <input className="input-field" placeholder="My Report" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label block mb-2">Format</label>
              <select className="input-field" value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value }))}>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="label block mb-2">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="custom">Custom</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="label block mb-2">From</label>
              <input type="date" className="input-field" value={form.dateFrom} onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))} />
            </div>
            <div>
              <label className="label block mb-2">To</label>
              <input type="date" className="input-field" value={form.dateTo} onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label block mb-2">Sections</label>
            <div className="flex gap-2 flex-wrap">
              {sectionOptions.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.sections.includes(s)}
                    onChange={e => setForm(p => ({ ...p, sections: e.target.checked ? [...p.sections, s] : p.sections.filter(x => x !== s) }))} />
                  <span className="text-sm capitalize" style={{ color: 'var(--color-text)' }}>{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={generateReport} disabled={generating} className="btn-primary px-4 py-2 text-sm">
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Reports list */}
      {loading ? <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} style={{ height: 80 }} />)}</div>
        : reports.length === 0 ? (
          <div className="card p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <MdDescription size={48} className="mx-auto mb-3 opacity-30" />
            <p>No reports yet. Generate your first report above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r._id} className="card p-4 flex items-center gap-4">
                <div className="text-2xl">{FORMAT_ICONS[r.format] || '📄'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{r.name}</span>
                    <span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                    <span className="badge badge-info text-xs">{r.format.toUpperCase()}</span>
                    {(r.status === 'generating' || r.status === 'pending') && (
                      <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(r.dateRange?.from).toLocaleDateString()} – {new Date(r.dateRange?.to).toLocaleDateString()} •
                    Created {new Date(r.createdAt).toLocaleString()}
                    {r.fileSize && ` • ${(r.fileSize / 1024).toFixed(1)} KB`}
                  </p>
                </div>
                <div className="flex gap-1">
                  {r.status === 'completed' && (
                    <button onClick={() => downloadReport(r._id, r.name, r.format)} className="btn-ghost px-3 py-2 text-sm flex items-center gap-1 text-green-400">
                      <MdDownload size={16} /> Download
                    </button>
                  )}
                  <button onClick={() => deleteReport(r._id)} className="btn-ghost p-2 text-red-400"><MdDelete size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
