import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import allScenarios from '@/lib/scenarios.json';
import type { Scenario } from '@/types';
import { ScenarioClient } from './components/scenario-client';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return allScenarios.map((scenario) => ({
    id: scenario.id,
  }));
}

export default function ScenarioPage({ params }: { params: { id: string } }) {
  const scenario = allScenarios.find((s) => s.id === params.id) as Scenario | undefined;

  if (!scenario) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background/80 backdrop-blur-sm md:px-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/scenarios">
            <ChevronLeft className="w-4 h-4" />
            <span className="sr-only">Back to Scenarios</span>
          </Link>
        </Button>
        <h1 className="ml-4 text-lg font-semibold font-headline">{scenario.title}</h1>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <ScenarioClient scenario={scenario} />
      </main>
    </div>
  );
}
