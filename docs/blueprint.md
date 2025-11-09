# **App Name**: Flashpoint AI Trainer

## Core Features:

- Scenario Loading: Load emergency scenarios from pre-built JSON files.
- Dynamic Decision Generation: Use Gemini 2.5 Flash to generate decision choices dynamically based on the scenario.
- Video Outcome Playback: Play pre-generated videos based on user decisions.
- AI Feedback and Scoring: Evaluate the user's choices and provide AI-generated feedback, explaining the consequences of their decisions. The LLM will act as a tool that makes the evaluation, as the scoring dimensions for optimal performance are explicitly detailed in the prompt.
- Performance Metrics Display: Display performance metrics such as response time, accuracy percentage, and confidence level.
- Scenario Storage: Store the scenarios, video paths and user decisions in Firestore.

## Style Guidelines:

- Primary color: Dark blue (#243A73), inspired by emergency lights, symbolizing trust, stability, and knowledge.
- Background color: Dark gray (#28292c), providing a high-contrast backdrop for content.
- Accent color: Red (#FFC857), highlighting key interactive elements like decision buttons, and numerical information in the performance review, indicating a call for action or caution, in a sort of intense, emergency.
- Body and headline font: 'Inter' for a modern, objective, and readable design. Inter is a sans-serif.
- Use clear, intuitive icons for scenario types, learning objectives, and performance metrics.
- Use a clear and structured layout with a left panel for scenario display and a right panel for decision interface.
- Employ subtle animations for loading states, video transitions, and feedback displays to enhance user experience.