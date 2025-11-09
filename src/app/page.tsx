import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AnalyticsIcon, FlashpointIcon, PlayIcon } from '@/components/icons';

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.1), transparent), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath d=\'M0 0 H100 V100 H0 Z\' fill=\'none\' stroke=\'hsl(232 5% 25% / 0.5)\' stroke-width=\'1\' /%3E%3C/svg%3E")',
        backgroundSize: '100px 100px, 50px 50px',
      }}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-2xl inline-block">
          <FlashpointIcon className="h-16 w-16 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter max-w-2xl">
          AI-Generated Emergency Response Training
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Simulate, Decide, Learn.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg">
            <Link href="/scenarios">
              <PlayIcon className="mr-2 h-5 w-5" />
              Start Simulation
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
