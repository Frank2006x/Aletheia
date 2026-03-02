"use client";

import { Card } from "@/components/ui/card";
import ChartRenderer from "@/components/ChartRenderer";
import type { AutoAnalysisResult } from "@/types";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  XCircle,
  CheckCheck,
} from "lucide-react";

interface AnalysisDashboardProps {
  analysis: AutoAnalysisResult;
}

export function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  const { charts, analysis: reportAnalysis, esgScore } = analysis;

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-[#050505]">
      {/* Row 1: Charts */}
      {charts.slice(0, 2).map((chartWithInsight, index) => (
        <Card
          key={`chart-${index}`}
          className="p-4 bg-[#0a0a0a] border border-white/[0.08] flex flex-col gap-3"
        >
          {/* Chart area — distinct inner background */}
          <div className="rounded-lg bg-[#141414] border border-white/[0.05] p-2">
            <ChartRenderer config={chartWithInsight.chartConfig} />
          </div>
          {chartWithInsight.insight && (
            <div className="flex items-start gap-2 pt-1 border-t border-white/[0.06]">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/50 italic">
                {chartWithInsight.insight}
              </p>
            </div>
          )}
        </Card>
      ))}

      {/* Row 2: ESG Score */}
      <Card className="p-6 bg-[#0a0a0a] border border-primary/20 flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
          <CheckCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
            ESG Score
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <div className="flex items-end gap-3">
            <span className="text-6xl font-bold text-primary tabular-nums">
              {esgScore}
            </span>
            <span className="text-xl text-white/30 mb-1">/100</span>
          </div>
          <div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${esgScore}%` }}
              />
            </div>
            <p className="text-xs text-white/30 mt-2">
              GRI Compliance: {reportAnalysis.griCompliance.score}%
            </p>
          </div>
        </div>
      </Card>

      {/* Row 2: Improvements */}
      <Card className="p-6 bg-[#0a0a0a] border border-white/[0.08] flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Improvements
          </span>
        </div>
        <div className="space-y-2 max-h-44 overflow-y-auto">
          {reportAnalysis.improvements.slice(0, 4).map((improvement, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-3 bg-amber-500/[0.06] border-l-2 border-amber-500/60 rounded-r-lg"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400/70 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/70 leading-relaxed">
                {improvement}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 3: Merits */}
      <Card className="p-6 bg-[#0a0a0a] border border-white/[0.08] flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Merits
          </span>
        </div>
        <div className="space-y-2 max-h-44 overflow-y-auto">
          {reportAnalysis.merits.slice(0, 4).map((merit, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-3 bg-primary/[0.06] border-l-2 border-primary/60 rounded-r-lg"
            >
              <CheckCircle2 className="w-3 h-3 text-primary/70 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/70 leading-relaxed">{merit}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 3: Drawbacks */}
      <Card className="p-6 bg-[#0a0a0a] border border-white/[0.08] flex flex-col col-span-2">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
          <ClipboardList className="w-4 h-4 text-white/50" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
            GRI Standards Coverage
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {reportAnalysis.griCompliance.missingStandards.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <XCircle className="w-3.5 h-3.5 text-orange-400" />
                <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                  Missing
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {reportAnalysis.griCompliance.missingStandards
                  .slice(0, 5)
                  .map((standard, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange-500/10 text-orange-300/80 text-xs font-medium rounded-md border border-orange-500/20"
                    >
                      {standard}
                    </span>
                  ))}
              </div>
            </div>
          )}
          {reportAnalysis.griCompliance.coveredStandards.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Covered
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {reportAnalysis.griCompliance.coveredStandards
                  .slice(0, 5)
                  .map((standard, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary/80 text-xs font-medium rounded-md border border-primary/20"
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
