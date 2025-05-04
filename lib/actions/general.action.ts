"use server";

// Import AI generation utilities
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

// Import Firebase and schema
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

/**
 * Creates or updates feedback for an interview using AI analysis
 */
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // Format the transcript into a readable string for the AI
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Generate AI feedback using Google's Gemini model
    const { object } = await generateObject({
      model: google("gemini-2.5-flash", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema, // Schema defines the structure of the response
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Prepare feedback object with AI-generated data
    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    // Use existing feedback document or create a new one
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc(); // Auto-generate ID
    }

    // Save feedback to Firestore
    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    // Log error and return failure response
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

// Retrieves a specific interview by its ID
export async function getInterviewById(id: string): Promise<Interview | null> {
  // Fetch interview document from Firestore
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

// Gets feedback for a specific interview and user
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  // If interviewId or userId is undefined or null, return null to prevent Firestore errors
  if (!interviewId || !userId) {
    return null;
  }

  // Query feedback collection with filters
  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1) // Only need one result
    .get();

  if (querySnapshot.empty) return null;

  // Return feedback with document ID included
  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

// Retrieves the most recent interviews excluding the user's own
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  // If userId is undefined or null, return empty array to prevent Firestore errors
  if (!userId) {
    return [];
  }

  // Query for finalized interviews by other users, sorted by date
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc") // Most recent first
    .where("finalized", "==", true) // Only completed interviews
    .where("userId", "!=", userId) // Exclude current user's interviews
    .limit(limit) // Limit results
    .get();

  // Map documents to objects with IDs included
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/**
 * Gets all interviews created by a specific user
 */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  // If userId is undefined or null, return empty array to prevent Firestore errors
  if (!userId) {
    return [];
  }
  
  // Query for all interviews by this user
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId) // Filter by user
    .orderBy("createdAt", "desc") // Most recent first
    .get();

  // Map documents to objects with IDs included
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
