"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CsvPreviewProps {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export function CsvPreview({ headers, rows, fileName }: CsvPreviewProps) {
  return (
    <div className="h-full overflow-auto bg-[#050505] p-4">
      <Card className="bg-black border border-white/[0.08]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">
            CSV Preview: {fileName}
          </CardTitle>
          <p className="text-sm text-white/40">
            Showing {rows.length} rows × {headers.length} columns
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[calc(100vh-300px)] border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-primary/10 sticky top-0 border-b border-primary/30">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-primary border-r border-white/[0.06]">
                    #
                  </th>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 text-left font-semibold text-primary border-r border-white/[0.06] whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] ${rowIdx % 2 === 0 ? "bg-black" : "bg-white/[0.02]"
                      }`}
                  >
                    <td className="px-4 py-2 border-r border-white/[0.06] font-medium text-white/30 tabular-nums">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 border-r border-white/[0.06] whitespace-nowrap text-white/70"
                      >
                        {cell || <span className="text-white/20">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
