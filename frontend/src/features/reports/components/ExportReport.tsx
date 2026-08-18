import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

interface ExportReportProps {
  title?: string;
}

export const ExportReport: React.FC<ExportReportProps> = ({ title = 'Export Analytics Report' }) => {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = () => {
    setDownloading(true);
    setSuccess(false);
    setTimeout(() => {
      setDownloading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
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
                onClick={handleExport}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={downloading}
                icon={<Download size={14} />}
                onClick={handleExport}
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
