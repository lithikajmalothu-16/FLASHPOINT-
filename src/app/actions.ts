'use server';

import {
  generateDecisionChoices,
  GenerateDecisionChoicesInput,
} from '@/ai/flows/generate-decision-choices';
import {
  evaluateUserDecision,
  EvaluateUserDecisionInput,
  EvaluateUserDecisionOutput,
} from '@/ai/flows/evaluate-user-decisions';
import {
  generateScenarioImages,
  GenerateScenarioImagesInput,
  GenerateScenarioImagesOutput,
} from '@/ai/flows/generate-scenario-images';

export async function getDecisionChoices(
  input: GenerateDecisionChoicesInput
): Promise<string[]> {
  try {
    const result = await generateDecisionChoices(input);
    return result.decisionChoices;
  } catch (error) {
    console.error('Error generating decision choices:', error);
    // Return mock data on failure to allow UI to function
    return [
      "Mock Decision 1: Evacuate immediately.",
      "Mock Decision 2: Wait for more information.",
      "Mock Decision 3: Secure the area and assess damage.",
    ];
  }
}

export async function getDecisionEvaluation(
  input: EvaluateUserDecisionInput
): Promise<EvaluateUserDecisionOutput> {
  try {
    const result = await evaluateUserDecision(input);
    return result;
  } catch (error) {
    console.error('Error evaluating user decision:', error);
    // Return mock data on failure
    return {
      score: 50,
      feedback:
        "- This is mock feedback because the AI call failed. \n- Your decision to '" +
        input.userChoice +
        "' has been noted. \n- In a real scenario, this would have moderate consequences. \n- It's crucial to balance speed and information gathering.",
      decisionAccuracy: 92,
      confidenceLevel: 87,
      performanceAnalysis: {
        decisionSpeed: 80,
        accuracy: 90,
        riskAssessment: 70,
        resourceManagement: 60,
        communication: 75,
        safetyProtocols: 95,
      },
    };
  }
}

export async function getScenarioImages(
  input: GenerateScenarioImagesInput
): Promise<GenerateScenarioImagesOutput> {
  // Increase the timeout for this specific action
  // This is a temporary solution for Vercel Hobby tier
  const result = await generateScenarioImages(input);
  return result;
}
