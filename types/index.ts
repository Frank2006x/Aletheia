// Type definitions for CSV upload and chat functionality

export interface CsvUploadResponse {
  success: boolean;
  upload?: {
    id: string;
    fileName: string;
    fileHash: string;
    fileSize: number;
    uploadedAt: Date;
  };
  autoAnalysis?: AutoAnalysisResult;
  message?: string;
  error?: string;
}

export interface ReportAnalysis {
  merits: string[];
  improvements: string[];
  griCompliance: {
    score: number;
    coveredStandards: string[];
    missingStandards: string[];
  };
  recommendations: string[];
  dataQuality?: {
    completeness: number;
    consistency: string;
    reliability: string;
  };
  analyzedAt?: string;
}

export interface ChartWithInsight {
  chartConfig: ChartConfig;
  insight?: string;
}

export interface AutoAnalysisResult {
  summary: string;
  esgScore: number;
  charts: ChartWithInsight[];
  analysis: ReportAnalysis;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  chartConfig?: ChartConfig;
  reportAnalysis?: ReportAnalysis;
  timestamp: Date;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "doughnut";
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options?: {
    responsive?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: "top" | "bottom" | "left" | "right";
      };
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    scales?: Record<string, unknown>;
  };
}

export interface AgentResponse {
  message: string;
  chartConfig?: ChartConfig;
  threadId: string;
}

export interface ChatRequest {
  message: string;
  pdfUploadId: string;
  threadId: string;
}

// Database types
export interface Supplier {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CsvUpload {
  id: string;
  supplierId: string;
  investorId: string;
  parsedData: Array<Record<string, string>>;
  fileName: string;
  fileHash: string;
  fileSize: number;
  uploadLocked: boolean;
  uploadedAt: Date;
  anomalyScore: number;
}
