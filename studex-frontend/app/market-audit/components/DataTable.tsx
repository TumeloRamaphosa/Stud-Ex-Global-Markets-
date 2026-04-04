'use client';

interface Column {
  key: string;
  header: string;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  title?: string;
}

export default function DataTable({ columns, data, title }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      {title && (
        <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02]">
          <h4 className="text-sm font-semibold text-gray-300">{title}</h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.04]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-white/[0.03] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-sm text-gray-300">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
