'use server';

import {
  generateDecisionChoices,
  GenerateDecisionChoicesInput,
} from '@/ai/flows/generate-decision-choices';
import {
  evaluateUserDecision,
  EvaluateUserDecisionInput,
} from '@/ai/flows/evaluate-user-decisions';

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
): Promise<{ score: number; feedback: string }> {
  try {
    const result = await evaluateUserDecision(input);
    return result;
  } catch (error) {
    console.error('Error evaluating user decision:', error);
    // Return mock data on failure
    return {
      score: 50,
      feedback:
        "This is mock feedback because the AI call failed. Your decision to '" +
        input.userChoice +
        "' has been noted. In a real scenario, this would have moderate consequences. It's crucial to balance speed and information gathering.",
    };
  }
}
