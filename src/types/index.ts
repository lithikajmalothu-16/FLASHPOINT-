
export type Scenario = {
  id: string;
  title: string;
  description: string;
  stats?: string;
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
