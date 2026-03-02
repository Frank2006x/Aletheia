"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CsvPreviewProps {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export function CsvPreview({ headers, rows, fileName }: CsvPreviewProps) {
  return (
    <div className="h-full overflow-auto bg-white p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#1B4332]">
            CSV Preview: {fileName}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Showing {rows.length} rows × {headers.length} columns
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[calc(100vh-300px)] border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-[#1B4332] text-white sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium border-r border-[#2D5F4C]">
                    #
                  </th>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2 text-left font-medium border-r border-[#2D5F4C] whitespace-nowrap"
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
                    className={rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-2 border-r border-gray-200 font-medium text-gray-600">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 border-r border-gray-200 whitespace-nowrap"
                      >
                        {cell || "-"}
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
