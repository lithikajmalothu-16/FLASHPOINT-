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
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

import type { Scenario, EvaluationResult } from '@/types';
import { getDecisionChoices, getDecisionEvaluation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import placeholderData from '@/lib/placeholder-images.json';
import { useToast } from '@/hooks/use-toast';

type GameState = 'intro' | 'deciding' | 'evaluating' | 'feedback';

const chartConfig = {
  value: {
    label: 'Value',
  },
  'decision-speed': {
    label: 'Decision Speed',
    color: 'hsl(var(--chart-1))',
  },
  accuracy: {
    label: 'Accuracy',
    color: 'hsl(var(--chart-1))',
  },
  'risk-assessment': {
    label: 'Risk Assessment',
    color: 'hsl(var(--chart-1))',
  },
  'resource-management': {
    label: 'Resource Management',
    color: 'hsl(var(--chart-1))',
  },
  communication: {
    label: 'Communication',
    color: 'hsl(var(--chart-1))',
  },
  'safety-protocols': {
    label: 'Safety Protocols',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

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

  const chartData = useMemo(() => {
    if (!evaluation || !evaluation.performanceAnalysis) {
      return [];
    }
    return [
      { dimension: 'Decision Speed', value: evaluation.performanceAnalysis.decisionSpeed },
      { dimension: 'Accuracy', value: evaluation.performanceAnalysis.accuracy },
      { dimension: 'Risk Assessment', value: evaluation.performanceAnalysis.riskAssessment },
      { dimension: 'Resource Management', value: evaluation.performanceAnalysis.resourceManagement },
      { dimension: 'Communication', value: evaluation.performanceAnalysis.communication },
      { dimension: 'Safety Protocols', value: evaluation.performanceAnalysis.safetyProtocols },
    ];
  }, [evaluation]);

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
            <AlertCircle className="w-16 h-16 text-primary" />
            <h3 className="text-2xl font-semibold font-headline">Your Mission</h3>
            <p className="text-muted-foreground">
              You are faced with a critical situation. Read the scenario description, and when you are ready, begin the simulation to see your choices. Your performance will be evaluated.
            </p>
            <Button size="lg" className="mt-4" onClick={handleStart}>
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
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20">
                      <Target className="w-5 h-5 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-muted-foreground">Decision Accuracy</h4>
                  </div>
                  <p className="mt-2 text-3xl font-bold">{evaluation.decisionAccuracy}%</p>
                  <p className="text-sm text-green-500">Above peer average</p>
                </Card>
                 <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-muted-foreground">Confidence Level</h4>
                  </div>
                   <p className="mt-2 text-3xl font-bold">{evaluation.confidenceLevel}%</p>
                   <p className="text-sm text-blue-500">Strong performance</p>
                </Card>
                <Card className="p-4">
                   <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20">
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-muted-foreground">Avg Response Time</h4>
                  </div>
                  <p className="mt-2 text-3xl font-bold">{responseTime?.toFixed(1)}s</p>
                  <p className="text-sm text-red-500">0.3s improvement</p>
                </Card>
              </div>
              
              {/* Performance Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="w-full aspect-square h-[250px]"
                >
                  <ResponsiveContainer>
                    <RadarChart data={chartData}>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <PolarAngleAxis dataKey="dimension" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <PolarGrid />
                      <Radar
                        dataKey="value"
                        fill="var(--color-value)"
                        fillOpacity={0.6}
                        stroke="var(--color-value)"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                </CardContent>
              </Card>


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
