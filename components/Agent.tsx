"use client";

// Import necessary dependencies
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Import utility functions and services
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk"; // Voice API SDK for handling voice interactions
import { interviewer } from "@/constants"; // Interviewer configuration
import { createFeedback } from "@/lib/actions/general.action"; // Action for creating feedback

// Enum to track the current status of the call
enum CallStatus {
  INACTIVE = "INACTIVE", // Call not started
  CONNECTING = "CONNECTING", // Call is being established
  ACTIVE = "ACTIVE", // Call is in progress
  FINISHED = "FINISHED", // Call has ended
}

// Interface for storing conversation messages
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

/**
 * Agent Component - Handles the AI interview experience
 */
const Agent = ({userName, userId, interviewId, feedbackId, type, questions}: AgentProps) => {
  const router = useRouter(); // Next.js router for navigation
  
  // State management
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE); // Track call status
  const [messages, setMessages] = useState<SavedMessage[]>([]); // Store conversation history
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if AI is currently speaking
  const [lastMessage, setLastMessage] = useState<string>(""); // Store the most recent message for display

  // Set up event listeners for voice API interactions
  useEffect(() => {
    // Handler for when call begins
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    // Handler for when call ends
    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    // Handler for receiving messages (transcripts)
    const onMessage = (message: Message) => {
      // Only process final transcripts, not interim ones
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]); // Add message to conversation history
      }
    };

    // Handler for when AI starts speaking
    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true); // Update UI to show speaking animation
    };

    // Handler for when AI stops speaking
    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false); // Update UI to hide speaking animation
    };

    // Error handler
    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    // Register all event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []); // Empty dependency array means this runs once on mount
 
  // Handle message updates and call completion
  useEffect(() => {
    // Update the last message for display whenever messages change
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    // Function to generate and save feedback from the interview transcript
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      // Call API to create feedback record in the database
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages, // Pass the entire conversation history
        feedbackId, // Pass existing feedbackId if available
      });

      // Navigate based on API response
      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`); // Go to feedback page
      } else {
        console.log("Error saving feedback");
        router.push("/"); // Return to home on error
      }
    };

    // Handle navigation when call is finished
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/"); // For generate type, just go home
      } else {
        handleGenerateFeedback(messages); // For feedback type, process feedback
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]); // Re-run when these dependencies change

  /**
   * Start the interview call
   * Initializes the voice API with appropriate workflow and variables
   */
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING); // Update UI to show connecting state

    if (type === "generate") {
      // For generating a new interview, use the workflow ID from environment variables
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName, // Pass user name to the AI
          userid: userId, // Pass user ID to the AI
        },
      });
    } else {
      // For feedback type, format questions and use the interviewer workflow
      let formattedQuestions = "";
      if (questions) {
        // Format questions as a bulleted list
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      // Start the interview with the formatted questions
      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  /**
   * End the active call
   * Updates state and stops the voice API
   */
  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED); // Update call status
    vapi.stop(); // Stop the voice API call
  };

  // Render the interview interface
  return (
    <>
      {/* Main view with AI and user cards */}
      <div className="call-view">
        {/* AI Interviewer Card - Shows the AI avatar and speaking animation */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {/* Animated speaking indicator that appears when AI is talking */}
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card - Shows the user's avatar and name */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Transcript display - Shows the last message in the conversation */}
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage} // Use message content as key to trigger animations
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100" // Animation for new messages
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call control buttons */}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          // Start call button - Shows when call is not active
          <button className="relative btn-call" onClick={() => handleCall()}>
            {/* Animated ping effect when connecting */}
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden" // Only show when connecting
              )}
            />

            <span className="relative">
              {/* Button text changes based on call status */}
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call" // Ready to start
                : ". . ."} // Connecting
            </span>
          </button>
        ) : (
          // End call button - Shows when call is active
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
