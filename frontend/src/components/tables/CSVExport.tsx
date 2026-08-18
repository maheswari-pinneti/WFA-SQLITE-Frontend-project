import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { filterByDepartment } from '../../utils/filterByDepartment';
import { Download } from 'lucide-react';

interface CSVExportProps {
  data: any[];
  filename?: string;
  buttonText?: string;
}

export const CSVExport: React.FC<CSVExportProps> = ({
  data,
  filename = 'workforce_analytics_export.csv',
  buttonText = 'Export CSV Data (DBAC Filtered)',
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const handleExport = () => {
    const allowedData = filterByDepartment(data, user);

    if (allowedData.length === 0) {
      alert('No authorized records available to export for your department scope.');
      return;
    }

    const headers = Object.keys(allowedData[0]).join(',');
    const rows = allowedData.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/30"
    >
      <Download size={14} />
      <span>{buttonText}</span>
    </button>
  );
};
