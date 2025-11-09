
export type ScenarioStats = {
  age?: number;
  gender?: string;
  time?: string;
  location?: string;
  vitals?: {
    conscious: boolean;
    breathing: string;
    pulse: string;
  };
  common_info?: string;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  context: string;
  stats?: string | ScenarioStats;
  scoringDimensions: string;
  initialImageId: string;
  outcomeImageIds: string[];
};

export type PerformanceAnalysis = {
  decisionSpeed: number;
  accuracy: number;
  riskAssessment: number;
  resourceManagement: number;
  communication: number;
  safetyProtocols: number;
};

export type EvaluationResult = {
  score: number;
  feedback: string;
  decisionAccuracy: number;
  confidenceLevel: number;
  performanceAnalysis: PerformanceAnalysis;
};
