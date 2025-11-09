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

const EvaluateUserDecisionOutputSchema = z.object({
  score: z.number().describe('The score of the user decision (0-100).'),
  feedback: z.string().describe('The AI-generated feedback on the user decision.'),
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
  Provide a score between 0 and 100 and give detailed feedback explaining the consequences of their choice in relation to the scoring dimensions.
  Explain why the choice resulted in that score and what could have been done differently.
  Format the score as a number and feedback as text. Do not include any introductory or concluding remarks.
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
