// A simple admin page to generate images for scenarios.
// This is not intended to be a user-facing page.
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getScenarioImages } from '@/app/actions';
import allScenarios from '@/lib/scenarios.json';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GeneratedImage = {
  prompt: string;
  url: string;
};

export default function GenerateImagesPage() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (scenario: (typeof allScenarios)[0]) => {
    setIsLoading(true);
    setSelectedScenarioId(scenario.id);
    setGeneratedImages([]);
    
    toast({
      title: 'Generating Images...',
      description: `Asking the AI to create images for "${scenario.title}". This may take a moment.`,
    });

    try {
      const result = await getScenarioImages({
        scenarioDescription: scenario.description,
        imageCount: 3,
      });

      if (result.images.length === 0) {
         toast({
          variant: "destructive",
          title: "Generation Failed",
          description: "The AI was unable to generate images for this scenario. Please try again.",
        });
      } else {
        setGeneratedImages(result.images);
        toast({
          title: "Generation Complete",
          description: `Successfully generated ${result.images.length} images.`,
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Something went wrong while generating the images. Check the console for details.",
      });
    }

    setIsLoading(false);
    setSelectedScenarioId(null);
  };

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Image Generation Console</h1>
        <p className="text-muted-foreground">
          Use this page to generate a set of images for a scenario. The generated data can then be copied into{' '}
          <code className="font-mono bg-muted px-1 py-0.5 rounded">src/lib/placeholder-images.json</code>.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allScenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardHeader>
              <CardTitle>{scenario.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleGenerate(scenario)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && selectedScenarioId === scenario.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Images
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {generatedImages.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold font-headline">Generated Output</h2>
          <p className="text-muted-foreground mb-4">
            Copy the JSON block below and add it to the `placeholderImages` array in{' '}
            <code className="font-mono bg-muted px-1 py-0.5 rounded">src/lib/placeholder-images.json</code>.
          </p>
          
          <Textarea
            readOnly
            className="w-full h-64 font-mono text-xs bg-muted"
            value={JSON.stringify(
              generatedImages.map((img, index) => ({
                id: `scenario-cardiac-arrest-slide-${index + 1}`, // Remember to change this ID
                description: img.prompt,
                imageUrl: img.url,
                imageHint: "cardiac arrest", // Remember to change this hint
              })),
              null,
              2
            )}
          />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((img, index) => (
              <div key={index} className="border rounded-lg p-2">
                <Image
                  src={img.url}
                  width={600}
                  height={400}
                  alt={img.prompt}
                  className="w-full aspect-video object-cover rounded-md"
                />
                <p className="text-xs text-muted-foreground mt-2">{img.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
