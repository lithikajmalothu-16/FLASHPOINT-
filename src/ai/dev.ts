import { config } from 'dotenv';
config();

import '@/ai/flows/generate-decision-choices.ts';
import '@/ai/flows/evaluate-user-decisions.ts';