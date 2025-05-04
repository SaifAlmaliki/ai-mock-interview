// External dependencies
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod"; // Schema validation library

// ===================================================
// TECHNOLOGY MAPPINGS
// ===================================================
// Maps various ways users might input tech names to standardized values
// Used for normalizing technology stack inputs across the application
export const mappings = {
  // Frontend frameworks and libraries
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  
  // Backend technologies
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  nestjs: "nestjs",
  
  // Databases
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  redis: "redis",
  firebase: "firebase",
  
  // DevOps and infrastructure
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  
  // Design tools
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  figma: "figma",
  
  // Frontend technologies
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  
  // Programming languages
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  
  // API and data handling
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  
  // Build tools
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  
  // Package managers and version control
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  
  // ORM and state management
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  vuex: "vuex",
  
  // Testing
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  
  // Frameworks and CMS
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  
  // Hosting and deployment
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

// ===================================================
// AI INTERVIEWER CONFIGURATION
// ===================================================
// Configuration for the VAPI AI interviewer assistant
export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  // Initial greeting message from the AI
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  // Speech-to-text configuration
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  // Text-to-speech voice configuration
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,        // Lower values = more variation in voice
    similarityBoost: 0.8,  // Higher values = more similar to original voice
    speed: 0.9,            // Speaking speed (0.5-1.5)
    style: 0.5,            // Emotional intensity
    useSpeakerBoost: true, // Enhance speaker clarity
  },
  // AI model configuration
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate's questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

// ===================================================
// FEEDBACK SCHEMA
// ===================================================
// Zod schema defining the structure of interview feedback
// Used for validation and type safety with AI-generated feedback
export const feedbackSchema = z.object({
  // Overall interview score
  totalScore: z.number(),
  // Scores for specific assessment categories
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  // Lists of candidate's strengths and weaknesses
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  // Overall assessment and hiring recommendation
  finalAssessment: z.string(),
});

// ===================================================
// UI ASSETS
// ===================================================
// List of company logos used as interview covers
// Displayed on interview cards for visual variety
export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

// ===================================================
// SAMPLE DATA
// ===================================================
// Mock interview data for development and testing
// Used when real data is not available or for UI demonstrations
export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];
