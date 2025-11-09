import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import scenarios from '@/lib/scenarios.json';
import placeholderImages from '@/lib/placeholder-images.json';
import { FlashpointIcon } from '@/components/icons';

export default function Home() {
  const scenarioImages = placeholderImages.placeholderImages.reduce((acc, img) => {
    if (img.id.startsWith('scenario-')) {
      acc[img.id] = img;
    }
    return acc;
  }, {} as Record<string, typeof placeholderImages.placeholderImages[0]>);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <FlashpointIcon className="h-6 w-6 text-accent" />
          <span className="ml-2 text-lg font-semibold">Flashpoint AI Trainer</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-gradient-to-r from-accent to-primary-foreground text-transparent bg-clip-text">
                    Master Critical Decisions Under Pressure
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Engage in realistic emergency simulations, receive instant AI-powered feedback, and sharpen your decision-making skills with Flashpoint AI Trainer.
                  </p>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/hero-image/600/400"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="emergency command center"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="scenarios" className="w-full py-12 md:py-24 lg:py-32 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Available Scenarios</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose a scenario to begin your training. Each simulation is designed to test your abilities in a unique high-stakes environment.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {scenarios.map((scenario) => {
                const image = scenarioImages[`scenario-${scenario.id}`];
                return (
                  <Card key={scenario.id} className="flex flex-col overflow-hidden hover:shadow-lg hover:shadow-accent/10 transition-shadow duration-300">
                    <CardHeader className="p-0">
                      {image && (
                         <Image
                          src={image.imageUrl}
                          width={600}
                          height={400}
                          alt={image.description}
                          data-ai-hint={image.imageHint}
                          className="aspect-video object-cover"
                        />
                      )}
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                      <CardTitle className="font-headline">{scenario.title}</CardTitle>
                      <CardDescription className="mt-2">{scenario.description.substring(0, 100)}...</CardDescription>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                       <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href={`/scenarios/${scenario.id}`}>
                          Begin Training <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Flashpoint AI Trainer. All rights reserved.</p>
      </footer>
    </div>
  );
}
