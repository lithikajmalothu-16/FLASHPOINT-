'use server';
/**
 * @fileOverview Generates a video depicting the outcome of a user's decision in a scenario.
 *
 * - generateOutcomeVideo - A function that generates a video based on a scenario and a user's choice.
 * - GenerateOutcomeVideoInput - The input type for the generateOutcomeVideo function.
 * - GenerateOutcomeVideoOutput - The return type for the generateOutcomeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const GenerateOutcomeVideoInputSchema = z.object({
  scenarioDescription: z
    .string()
    .describe('The description of the emergency scenario.'),
  userChoice: z.string().describe("The user's selected course of action."),
});

export type GenerateOutcomeVideoInput = z.infer<
  typeof GenerateOutcomeVideoInputSchema
>;

const GenerateOutcomeVideoOutputSchema = z.object({
  videoUrl: z
    .string()
    .describe(
      'A data URI of the generated video showing the outcome. Format: data:video/mp4;base64,...'
    ),
  outcomePrompt: z
    .string()
    .describe('The prompt used to generate the video.'),
});

export type GenerateOutcomeVideoOutput = z.infer<
  typeof GenerateOutcomeVideoOutputSchema
>;

export async function generateOutcomeVideo(
  input: GenerateOutcomeVideoInput
): Promise<GenerateOutcomeVideoOutput> {
  return generateOutcomeVideoFlow(input);
}

const videoPromptGenerator = ai.definePrompt({
  name: 'videoPromptGenerator',
  input: { schema: GenerateOutcomeVideoInputSchema },
  output: { schema: z.object({ prompt: z.string() }) },
  prompt: `You are a film director specializing in intense, realistic training simulations.
    Your task is to create a single, highly descriptive text-to-video prompt.
    This prompt will generate a short video (5-8 seconds) illustrating the immediate, most likely consequence of a user's decision in an emergency scenario.

    The prompt should be photorealistic, cinematic, and dramatic. Focus on action and the direct result of the choice.

    - Scenario: {{{scenarioDescription}}}
    - User's Action: {{{userChoice}}}

    Generate a single, concise text-to-image prompt that shows the result of this action. Do not describe the user, only the scene's outcome.
    Example: If the action is "Use a fire extinguisher on a grease fire", a good prompt would be "Cinematic shot of a kitchen fire exploding violently as a fire extinguisher is used on it, grease splattering and flames engulfing the room."
  `,
});

const generateOutcomeVideoFlow = ai.defineFlow(
  {
    name: 'generateOutcomeVideoFlow',
    inputSchema: GenerateOutcomeVideoInputSchema,
    outputSchema: GenerateOutcomeVideoOutputSchema,
  },
  async (input) => {
    // 1. Generate a powerful video prompt from the scenario and choice.
    const { output: promptGenOutput } = await videoPromptGenerator(input);
    if (!promptGenOutput) {
      throw new Error('Failed to generate a video prompt.');
    }
    const outcomePrompt = promptGenOutput.prompt;
    console.log(`Generated video prompt: "${outcomePrompt}"`);

    // 2. Generate the video using Veo.
    let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: outcomePrompt,
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
      });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }

    // 3. Poll for completion. This can take a while.
    console.log('Video generation started. Polling for completion...');
    while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await ai.checkOperation(operation);
        console.log(`Operation status: ${operation.done ? 'Done' : 'In Progress'}`);
    }

    if (operation.error) {
        console.error('Video generation failed:', operation.error);
        throw new Error(`Failed to generate video: ${operation.error.message}`);
    }

    // 4. Extract the video from the result.
    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video || !video.media?.url) {
        throw new Error('Failed to find the generated video in the operation result.');
    }

    console.log('Video generation successful.');
    return {
      videoUrl: video.media.url,
      outcomePrompt,
    };
  }
);
