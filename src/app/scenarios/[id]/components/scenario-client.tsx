'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  BarChart,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import type { Scenario, EvaluationResult } from '@/types';
import { getDecisionChoices, getDecisionEvaluation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import placeholderData from '@/lib/placeholder-images.json';
import { useToast } from '@/hooks/use-toast';

type GameState = 'intro' | 'deciding' | 'evaluating' | 'feedback';

export function ScenarioClient({ scenario }: { scenario: Scenario }) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [isLoadingChoices, setIsLoadingChoices] = useState(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const { toast } = useToast();

  const imageMap = useMemo(() => {
    return placeholderData.placeholderImages.reduce((acc, img) => {
      acc[img.id] = img;
      return acc;
    }, {} as Record<string, typeof placeholderData.placeholderImages[0]>);
  }, []);

  const [currentImageId, setCurrentImageId] = useState(scenario.initialImageId);

  useEffect(() => {
    if (gameState === 'deciding' && startTime === null) {
      setStartTime(Date.now());
    }
  }, [gameState, startTime]);

  const handleStart = async () => {
    setIsLoadingChoices(true);
    setGameState('deciding');
    try {
      const decisionChoices = await getDecisionChoices({ scenarioDescription: scenario.description });
      setChoices(decisionChoices);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate decision choices. Please try again.",
      });
      handleReset();
    }
    setIsLoadingChoices(false);
  };

  const handleSelectChoice = async (choice: string, index: number) => {
    if (startTime) {
      setResponseTime((Date.now() - startTime) / 1000);
    }
    setIsLoadingEvaluation(true);
    setGameState('evaluating');
    setSelectedChoiceIndex(index);
    setCurrentImageId(scenario.outcomeImageIds[index % scenario.outcomeImageIds.length]);

    try {
      const result = await getDecisionEvaluation({
        scenarioDescription: scenario.description,
        availableChoices: choices,
        userChoice: choice,
        scoringDimensions: scenario.scoringDimensions,
      });
      setEvaluation(result);
      setGameState('feedback');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not evaluate your decision. Please try again.",
      });
      handleReset();
    }
    setIsLoadingEvaluation(false);
  };

  const handleReset = () => {
    setGameState('intro');
    setIsLoadingChoices(false);
    setIsLoadingEvaluation(false);
    setChoices([]);
    setEvaluation(null);
    setSelectedChoiceIndex(null);
    setStartTime(null);
    setResponseTime(null);
    setCurrentImageId(scenario.initialImageId);
  };

  const currentImage = imageMap[currentImageId];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Panel: Scenario & Video */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {currentImage && (
            <Image
              src={currentImage.imageUrl}
              width={800}
              height={450}
              alt={currentImage.description}
              data-ai-hint={currentImage.imageHint}
              className="object-cover w-full aspect-video transition-all duration-500 ease-in-out"
              priority
            />
          )}
        </CardContent>
        <CardHeader>
          <CardTitle className="font-headline">{scenario.title}</CardTitle>
          <CardDescription className="pt-2">{scenario.description}</CardDescription>
        </CardHeader>
      </Card>

      {/* Right Panel: Decisions & Feedback */}
      <Card className="flex flex-col">
        {gameState === 'intro' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <AlertCircle className="w-16 h-16 text-accent" />
            <h3 className="text-2xl font-semibold font-headline">Your Mission</h3>
            <p className="text-muted-foreground">
              You are faced with a critical situation. Read the scenario description, and when you are ready, begin the simulation to see your choices. Your performance will be evaluated.
            </p>
            <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleStart}>
              Begin Simulation
            </Button>
          </div>
        )}

        {(gameState === 'deciding' || gameState === 'evaluating') && (
          <div className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="font-headline">What's your next move?</CardTitle>
              <CardDescription>Choose the best course of action from the options below.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {isLoadingChoices ? (
                  <>
                    <Skeleton className="w-full h-12" />
                    <Skeleton className="w-full h-12" />
                    <Skeleton className="w-full h-12" />
                  </>
                ) : (
                  choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className="w-full h-auto justify-start text-left py-3"
                      onClick={() => handleSelectChoice(choice, index)}
                      disabled={gameState === 'evaluating'}
                    >
                      {isLoadingEvaluation && selectedChoiceIndex === index && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {choice}
                    </Button>
                  ))
                )}
                {gameState === 'evaluating' && (
                   <div className="flex items-center justify-center p-8 text-muted-foreground">
                    <Loader2 className="w-8 h-8 mr-4 animate-spin" />
                    <p>Evaluating consequences...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        )}

        {gameState === 'feedback' && evaluation && (
          <div className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="font-headline">Performance Review</CardTitle>
              <CardDescription>Here is the AI-powered evaluation of your decision.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-accent" />
                    <h4 className="font-semibold">Overall Score</h4>
                  </div>
                  <p className="mt-2 text-3xl font-bold">{evaluation.score}<span className="text-base font-normal text-muted-foreground">/100</span></p>
                  <Progress value={evaluation.score} className="mt-2 h-2" />
                </Card>
                 <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <h4 className="font-semibold">Response Time</h4>
                  </div>
                  <p className="mt-2 text-3xl font-bold">{responseTime?.toFixed(1)}s</p>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <h4 className="font-semibold">Confidence</h4>
                  </div>
                  <p className="mt-2 text-3xl font-bold">High</p>
                </Card>
              </div>

              {/* AI Feedback */}
              <div>
                <h4 className="flex items-center mb-2 text-lg font-semibold">
                  <Sparkles className="w-5 h-5 mr-2 text-accent" />
                  AI Feedback
                </h4>
                <div className="p-4 text-sm border rounded-lg bg-muted/20 text-muted-foreground">
                  <ul className="space-y-4 list-disc list-inside">
                    {evaluation.feedback.split('- ').filter(item => item.trim() !== '').map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
               <div className="pt-4 text-center">
                 <Button onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Run Simulation Again
                </Button>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
}
