import { config } from 'dotenv';
config();

import '@/ai/flows/generate-decision-choices.ts';
import '@/ai/flows/evaluate-user-decisions.ts';
import '@/ai/flows/generate-scenario-images.ts';
import '@/ai/flows/generate-outcome-video.ts';
