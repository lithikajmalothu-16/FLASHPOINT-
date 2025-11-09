
export type Scenario = {
  id: string;
  title: string;
  description: string;
  stats?: string;
  scoringDimensions: string;
  initialImageId: string;
  outcomeImageIds: string[];
};

export type EvaluationResult = {
  score: number;
  feedback: string;
};
