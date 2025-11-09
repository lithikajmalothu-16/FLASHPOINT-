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
  Lightbulb,
  Film,
} from 'lucide-react';
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

import type { Scenario, ScenarioStats } from '@/types';
import { getDecisionChoices, getDecisionEvaluation, getOutcomeVideo } from '@/app/actions';
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

const renderStats = (stats: string | ScenarioStats | undefined) => {
    if (!stats) return null;
  
    if (typeof stats === 'string') {
      return (
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {stats.split('<br>').map((stat, index) => (
                  <li key={index} className="flex items-start">
                      <span className="mr-2 mt-1 block h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{stat.replace(/• /g, '')}</span>
                  </li>
              ))}
          </ul>
      );
    }
  
    if (typeof stats === 'object' && stats !== null) {
      return (
        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
          {stats.age && <p><strong>Age:</strong> {stats.age}</p>}
          {stats.gender && <p><strong>Gender:</strong> {stats.gender}</p>}
          {stats.time && <p><strong>Time:</strong> {stats.time}</p>}
          {stats.location && <p><strong>Location:</strong> {stats.location}</p>}
          {stats.vitals && (
            <div>
              <strong>Vitals:</strong>
              <ul className="pl-4 list-disc">
                <li>Conscious: {stats.vitals.conscious ? 'Yes' : 'No'}</li>
                <li>Breathing: {stats.vitals.breathing}</li>
                <li>Pulse: {stats.vitals.pulse}</li>
              </ul>
            </div>
          )}
          {stats.common_info && <p className="pt-2"><em>{stats.common_info}</em></p>}
        </div>
      );
    }
  
    return null;
  };

export function ScenarioClient({ scenario }: { scenario: Scenario }) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [isLoadingChoices, setIsLoadingChoices] = useState(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [outcomeVideoUrl, setOutcomeVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const imageMap = useMemo(() => {
    return placeholderData.placeholderImages.reduce((acc, img) => {
      acc[img.id] = img;
      return acc;
    }, {} as Record<string, typeof placeholderData.placeholderImages[0]>);
  }, []);

  const [currentImageId, setCurrentImageId] = useState(scenario.initialImageId);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (gameState === 'deciding' && !isLoadingChoices && choices.length > 0) {
      if (startTime === null) {
        setStartTime(Date.now());
      }
      timerInterval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (timerInterval) {
      clearInterval(timerInterval);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [gameState, isLoadingChoices, choices, startTime]);

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
    
    // Use static image as a fallback
    setCurrentImageId(scenario.outcomeImageIds[index % scenario.outcomeImageIds.length]);

    // ** ONLY RUN VIDEO FOR FIRE SCENARIO FOR NOW **
    if (scenario.id === 'fire_emergency_response_001') {
      try {
        toast({
          title: 'Generating Consequence Video',
          description: 'The AI is creating a video of the outcome. This may take a minute...',
        });
        const videoResult = await getOutcomeVideo({
          scenarioDescription: scenario.description,
          userChoice: choice,
        });
        setOutcomeVideoUrl(videoResult.videoUrl);
      } catch (error) {
        console.error("Video generation failed:", error);
        toast({
          variant: "destructive",
          title: "Video Generation Failed",
          description: "Could not create the outcome video. Showing a static image instead.",
        });
      }
    }


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
    setElapsedTime(0);
    setOutcomeVideoUrl(null);
    setCurrentImageId(scenario.initialImageId);
  };

  const currentImage = imageMap[currentImageId];
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const showVideo = !!outcomeVideoUrl && scenario.id === 'fire_emergency_response_001';

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Panel: Scenario & Video */}
      <Card className="overflow-hidden">
        <CardContent className="p-0 bg-black">
          {showVideo ? (
              <video
                key={outcomeVideoUrl}
                className="w-full aspect-video"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={outcomeVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : currentImage ? (
            <Image
              src={currentImage.imageUrl}
              width={800}
              height={450}
              alt={currentImage.description}
              data-ai-hint={currentImage.imageHint}
              className="object-cover w-full aspect-video transition-all duration-500 ease-in-out"
              priority
            />
          ) : (
            <div className="w-full aspect-video bg-muted flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </CardContent>
        <CardHeader>
          <CardTitle className="font-headline">{scenario.title}</CardTitle>
          <div className="pt-2 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: scenario.description }} />
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">What's your next move?</CardTitle>
                  <CardDescription>Choose the best course of action from the options below.</CardDescription>
                </div>
                <div className="flex items-center gap-2 p-2 text-red-500 border border-red-500/50 rounded-lg bg-red-500/10 animate-pulse">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-lg font-semibold">{formatTime(elapsedTime)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {isLoadingChoices ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Get ready, Let Us Save Lives !</p>
                     <Card className="w-full p-4 mt-4 bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-base text-foreground">Incident Dangers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderStats(scenario.stats)}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className="w-full h-auto justify-start text-left py-3 whitespace-normal"
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
                {gameState === 'evaluating' && !isLoadingChoices && (
                   <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    {scenario.id === 'fire_emergency_response_001' ? (
                      <>
                        <Film className="w-8 h-8 mr-4 animate-pulse" />
                        <p>Generating video of consequences...</p>
                        <p className='text-xs'>(This may take up to a minute)</p>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-8 h-8 mr-4 animate-spin" />
                        <p>Evaluating consequences...</p>
                      </>
                    )}
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

              {/* AI Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    AI Feedback
                  </CardTitle >
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    {evaluation.feedback.split('- ').filter(item => item.trim() !== '').map((point, index) => (
                      <li key={index} className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
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
