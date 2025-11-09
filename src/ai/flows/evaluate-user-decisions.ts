'use server';
/**
 * @fileOverview AI-powered evaluation of user decisions in emergency scenarios.
 *
 * - evaluateUserDecision - Evaluates user decisions based on scoring dimensions and provides feedback.
 * - EvaluateUserDecisionInput - The input type for the evaluateUserDecision function.
 * - EvaluateUserDecisionOutput - The return type for the evaluateUserDecision function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateUserDecisionInputSchema = z.object({
  scenarioDescription: z
    .string()
    .describe('Description of the emergency scenario.'),
  availableChoices: z
    .array(z.string())
    .describe('The choices available to the user.'),
  userChoice: z.string().describe('The choice selected by the user.'),
  scoringDimensions: z
    .string()
    .describe(
      'The dimensions to use to score the user performance. e.g. "Casualty Reduction, Resource Management, Safety Prioritization".'
    ),
});

export type EvaluateUserDecisionInput = z.infer<
  typeof EvaluateUserDecisionInputSchema
>;

const PerformanceAnalysisSchema = z.object({
  decisionSpeed: z.number().describe('Score for decision speed (0-100).'),
  accuracy: z.number().describe('Score for accuracy (0-100).'),
  riskAssessment: z.number().describe('Score for risk assessment (0-100).'),
  resourceManagement: z.number().describe('Score for resource management (0-100).'),
  communication: z.number().describe('Score for communication (0-100).'),
  safetyProtocols: z.number().describe('Score for safety protocols (0-100).'),
});

const EvaluateUserDecisionOutputSchema = z.object({
  score: z.number().describe('The overall score of the user decision (0-100).'),
  feedback: z.string().describe('The AI-generated feedback on the user decision.'),
  decisionAccuracy: z.number().describe('The decision accuracy percentage (0-100).'),
  confidenceLevel: z.number().describe('The confidence level percentage (0-100).'),
  performanceAnalysis: PerformanceAnalysisSchema.describe('Detailed performance analysis scores.'),
});

export type EvaluateUserDecisionOutput = z.infer<
  typeof EvaluateUserDecisionOutputSchema
>;

export async function evaluateUserDecision(
  input: EvaluateUserDecisionInput
): Promise<EvaluateUserDecisionOutput> {
  return evaluateUserDecisionFlow(input);
}

const evaluateUserDecisionPrompt = ai.definePrompt({
  name: 'evaluateUserDecisionPrompt',
  input: {schema: EvaluateUserDecisionInputSchema},
  output: {schema: EvaluateUserDecisionOutputSchema},
  prompt: `You are an AI assistant evaluating user decisions in emergency scenarios.

  Scenario Description: {{{scenarioDescription}}}
  Available Choices: {{#each availableChoices}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  User Choice: {{{userChoice}}}
  Scoring Dimensions: {{{scoringDimensions}}}

  Evaluate the user's choice based on the scenario description and the specified scoring dimensions.
  Provide an overall score between 0 and 100.
  Also provide a decision accuracy score (0-100) and a confidence level score (0-100).
  Then, provide detailed scores (0-100) for each of the following performance analysis dimensions:
  - Decision Speed
  - Accuracy
  - Risk Assessment
  - Resource Management
  - Communication
  - Safety Protocols

  Then, provide feedback as 3-5 sharp, concise bullet points. Each bullet point should start with a "-".
  Each point should relate to the scene, the user's response, and the incident statistics.
  Explain why the choice resulted in that score and what could have been done differently.
  Format the scores as numbers and feedback as a single block of text.
  Do not include any introductory or concluding remarks.
  `,
});

const evaluateUserDecisionFlow = ai.defineFlow(
  {
    name: 'evaluateUserDecisionFlow',
    inputSchema: EvaluateUserDecisionInputSchema,
    outputSchema: EvaluateUserDecisionOutputSchema,
  },
  async input => {
    const {output} = await evaluateUserDecisionPrompt(input);
    return output!;
  }
);
