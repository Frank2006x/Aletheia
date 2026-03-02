"use client";

import { Card } from "@/components/ui/card";
import ChartRenderer from "@/components/ChartRenderer";
import type { AutoAnalysisResult } from "@/types";

interface AnalysisDashboardProps {
  analysis: AutoAnalysisResult;
}

export function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  const { charts, analysis: reportAnalysis, esgScore } = analysis;

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Row 1: Charts */}
      {charts.slice(0, 2).map((chartWithInsight, index) => (
        <Card
          key={`chart-${index}`}
          className="p-4 bg-white shadow-md flex flex-col"
        >
        <div style={{ height: "220px" }}>
            <ChartRenderer config={chartWithInsight.chartConfig} />
          </div>
          {chartWithInsight.insight && (
            <p className="mt-2 text-xs text-gray-600 italic border-t pt-2">
              💡 {chartWithInsight.insight}
            </p>
          )}
        </Card>
      ))}

      {/* Row 2: ESG Score */}
      <Card className="p-6 bg-white shadow-lg border-2 border-teal-500">
        <div className="space-y-3 h-full flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-900">ESG Score</h3>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-teal-600">
              {esgScore}
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-teal-500 to-green-500 transition-all"
                  style={{ width: `${esgScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                GRI Compliance: {reportAnalysis.griCompliance.score}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Row 2: Improvements */}
      <Card className="p-6 bg-white shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          ⚠️ Improvements
        </h3>
        <div className="space-y-2 max-h-50 overflow-y-auto">
          {reportAnalysis.improvements.slice(0, 4).map((improvement, index) => (
            <div
              key={index}
              className="p-3 bg-linear-to-r from-yellow-50 to-amber-50 border-l-3 border-yellow-500 rounded"
            >
              <p className="text-sm text-gray-800">{improvement}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 3: Merits */}
      <Card className="p-6 bg-white shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          ✅ Merits
        </h3>
        <div className="space-y-2 max-h-50 overflow-y-auto">
          {reportAnalysis.merits.slice(0, 4).map((merit, index) => (
            <div
              key={index}
              className="p-3 bg-linear-to-r from-green-50 to-emerald-50 border-l-3 border-green-500 rounded"
            >
              <p className="text-sm text-gray-800">{merit}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 3: Drawbacks (GRI Standards Coverage) */}
      <Card className="p-6 bg-white shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          📋 Drawbacks
        </h3>
        <div className="space-y-3">
          {reportAnalysis.griCompliance.missingStandards.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-orange-700 mb-2">
                ⊘ Missing Standards
              </h4>
              <div className="flex flex-wrap gap-1">
                {reportAnalysis.griCompliance.missingStandards
                  .slice(0, 5)
                  .map((standard, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded"
                    >
                      {standard}
                    </span>
                  ))}
              </div>
            </div>
          )}
          {reportAnalysis.griCompliance.coveredStandards.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-green-700 mb-2">
                ✓ Covered Standards
              </h4>
              <div className="flex flex-wrap gap-1">
                {reportAnalysis.griCompliance.coveredStandards
                  .slice(0, 5)
                  .map((standard, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
                    >
                      {standard}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
