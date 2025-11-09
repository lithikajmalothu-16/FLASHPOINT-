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
  prompt: `You are an AI assistant creating a training simulation for amateur emergency response officers.

Your task is to generate exactly three challenging and tricky decision choices for the given emergency scenario. These choices will be presented to the trainee.

The options should be framed from the perspective of an officer arriving at the scene.

Your goal is to test their decision-making skills. To do this, structure the three choices as follows:
1.  **The Most Efficient/Correct Action:** The professionally recommended, best-practice response that balances safety, effectiveness, and resource management.
2.  **A Plausible but Less-Optimal Action:** A choice that seems reasonable on the surface but has a hidden flaw, is less efficient, or misses a critical priority.
3.  **A Less Preferable Action:** A choice that is clearly not ideal, potentially unsafe, or a significant misjudgment of the situation.

The choices should be tricky enough to make an amateur officer pause and think. They should be concise, clear, and actionable.

Scenario Description: {{{scenarioDescription}}}

Generate the three choices. The order of the choices in the output array should be randomized.`,
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
