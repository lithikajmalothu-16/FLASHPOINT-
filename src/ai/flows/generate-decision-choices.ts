'use server';

/**
 * @fileOverview Generates decision choices dynamically based on the current scenario using GenAI.
 *
 * - generateDecisionChoices - A function that generates decision choices for a given scenario.
 * - GenerateDecisionChoicesInput - The input type for the generateDecisionChoices function.
 * - GenerateDecisionChoicesOutput - The return type for the generateDecisionChoices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDecisionChoicesInputSchema = z.object({
  scenarioDescription: z
    .string()
    .describe('The description of the current emergency scenario.'),
});

export type GenerateDecisionChoicesInput = z.infer<typeof GenerateDecisionChoicesInputSchema>;

const GenerateDecisionChoicesOutputSchema = z.object({
  decisionChoices: z
    .array(z.string())
    .describe('An array of possible decision choices for the scenario.'),
});

export type GenerateDecisionChoicesOutput = z.infer<typeof GenerateDecisionChoicesOutputSchema>;

export async function generateDecisionChoices(
  input: GenerateDecisionChoicesInput
): Promise<GenerateDecisionChoicesOutput> {
  return generateDecisionChoicesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDecisionChoicesPrompt',
  input: {schema: GenerateDecisionChoicesInputSchema},
  output: {schema: GenerateDecisionChoicesOutputSchema},
  prompt: `You are an AI assistant designed to generate possible decision choices for an emergency scenario.

  Given the following scenario description, generate an array of 3-5 possible and realistic decision choices that a user could take.

  Scenario Description: {{{scenarioDescription}}}

  Ensure that each choice is clear, concise, and actionable.
  The output should be an array of strings.
  `,
});

const generateDecisionChoicesFlow = ai.defineFlow(
  {
    name: 'generateDecisionChoicesFlow',
    inputSchema: GenerateDecisionChoicesInputSchema,
    outputSchema: GenerateDecisionChoicesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
