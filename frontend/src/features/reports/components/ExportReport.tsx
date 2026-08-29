import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

interface ExportReportProps {
  title?: string;
}

export const ExportReport: React.FC<ExportReportProps> = ({ title = 'Export Analytics Report' }) => {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = (format: 'csv' | 'json') => {
    setDownloading(true);
    setSuccess(false);
    setTimeout(() => {
      const mockData = [
        { Metric: "Sprint Velocity", Target: "85%", Actual: "89.4%", Status: "PASSED" },
        { Metric: "Attendance Adherence", Target: "95%", Actual: "96.5%", Status: "PASSED" },
        { Metric: "Tasks Completed", Target: "50 Tasks", Actual: "55 Tasks", Status: "PASSED" },
        { Metric: "Leave Rate", Target: "< 5%", Actual: "2.4%", Status: "PASSED" }
      ];

      let fileContent = '';
      let mimeType = '';
      let fileExtension = '';

      if (format === 'csv') {
        const headers = Object.keys(mockData[0]).join(',');
        const rows = mockData.map(row => 
          Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        fileContent = [headers, ...rows].join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
      } else {
        fileContent = JSON.stringify(mockData, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        fileExtension = 'json';
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_export.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold">{title}</h4>
            <p className="text-xs text-slate-400">Download formatted workforce compliance data</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {success ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
              <CheckCircle2 size={16} />
              Downloaded Successfully!
            </div>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                isLoading={downloading}
                icon={<Download size={14} />}
                onClick={() => handleExport('csv')}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={downloading}
                icon={<Download size={14} />}
                onClick={() => handleExport('json')}
              >
                Export JSON
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
