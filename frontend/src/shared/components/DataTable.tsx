import React from 'react';
import { ColumnDefinition, Column } from '../types/common.types';

export type { Column };

export interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  keyExtractor?: (item: T) => string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor = (item: any) => item.id || JSON.stringify(item),
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-semibold glass-panel">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="w-full overflow-x-auto max-h-[65vh] overflow-y-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || col.accessorKey || idx} className="py-3.5 px-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-slate-800/20 transition-colors">
                {columns.map((col, idx) => {
                  const val = col.accessorKey ? (item as any)[col.accessorKey] : undefined;
                  let rendered: React.ReactNode = null;

                  if (col.cell) {
                    rendered = (col.cell as any)(item, { row: { original: item }, getValue: () => val });
                  } else if (col.render) {
                    rendered = col.render(item);
                  } else {
                    rendered = val ?? (col.key ? (item as any)[col.key] : '');
                  }

                  return (
                    <td key={col.key || col.accessorKey || idx} className="py-3.5 px-4 text-slate-200 whitespace-nowrap">
                      {rendered}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
