'use server';
/**
 * @fileOverview Generates a series of images for a given scenario description.
 *
 * - generateScenarioImages - A function that generates a series of images.
 * - GenerateScenarioImagesInput - The input type for the generateScenarioImages function.
 * - GenerateScenarioImagesOutput - The return type for the generateScenarioImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScenarioImagesInputSchema = z.object({
  scenarioDescription: z
    .string()
    .describe('The description of the emergency scenario.'),
  imageCount: z
    .number()
    .min(1)
    .max(7)
    .default(3)
    .describe('The number of images to generate.'),
});

export type GenerateScenarioImagesInput = z.infer<
  typeof GenerateScenarioImagesInputSchema
>;

const GenerateScenarioImagesOutputSchema = z.object({
  images: z
    .array(
      z.object({
        prompt: z.string(),
        url: z.string(),
      })
    )
    .describe('An array of generated images with their corresponding prompts.'),
});

export type GenerateScenarioImagesOutput = z.infer<
  typeof GenerateScenarioImagesOutputSchema
>;

export async function generateScenarioImages(
  input: GenerateScenarioImagesInput
): Promise<GenerateScenarioImagesOutput> {
  return generateScenarioImagesFlow(input);
}

const imageGenPrompt = ai.definePrompt({
  name: 'scenarioImageGenPrompt',
  input: {
    schema: z.object({
      scenarioDescription: z.string(),
      imageCount: z.number(),
    }),
  },
  output: {
    schema: z.object({
      prompts: z
        .array(z.string())
        .describe(
          'An array of distinct, descriptive text-to-image prompts that visually tell a story about the provided emergency scenario. Each prompt should describe a unique moment or perspective of the scene. Focus on creating photorealistic, cinematic, and impactful images.'
        ),
    }),
  },
  prompt: `Based on the following emergency scenario, generate a sequence of {{{imageCount}}} text-to-image prompts to create a visual narrative.

Scenario: {{{scenarioDescription}}}`,
});

const generateScenarioImagesFlow = ai.defineFlow(
  {
    name: 'generateScenarioImagesFlow',
    inputSchema: GenerateScenarioImagesInputSchema,
    outputSchema: GenerateScenarioImagesOutputSchema,
  },
  async ({scenarioDescription, imageCount}) => {
    // 1. Generate a set of image prompts from the scenario
    const {output: promptGenOutput} = await imageGenPrompt({
        scenarioDescription,
        imageCount,
      });
    if (!promptGenOutput) {
      throw new Error('Could not generate image prompts.');
    }

    const imagePrompts = promptGenOutput.prompts;

    // 2. Generate an image for each prompt in parallel
    const imagePromises = imagePrompts.map(async prompt => {
      console.log(`Generating image for prompt: "${prompt}"`);
      try {
        const {media} = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `Action shot, dramatic lighting, photorealistic: ${prompt}`,
          });
          return {
            prompt: prompt,
            url: media.url,
          };
      } catch (e) {
        console.error(`Failed to generate image for prompt: "${prompt}"`, e);
        // Return a placeholder or null so that Promise.all doesn't fail completely
        return null;
      }
    });

    const settledImages = await Promise.all(imagePromises);
    
    // Filter out any failed generations
    const images = settledImages.filter(img => img !== null) as {prompt: string, url: string}[];

    if (images.length === 0 && imagePrompts.length > 0) {
      throw new Error("All image generations failed. Please check the logs.");
    }
    
    return {images};
  }
);
