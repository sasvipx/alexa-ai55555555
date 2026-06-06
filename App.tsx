export interface ChatMessage {
  id: string;
  sender: "user" | "alexa";
  text: string;
  timestamp: Date;
  audioUrl?: string; // Cache local synthesised voice Blobs
  isAiVoice?: boolean; // Label if generated through Gemini advanced TTS
}

export interface SkillConfig {
  skillName: string;
  invocationName: string;
  skillType: string;
  aiIntelligence: "standard" | "super-intelligent";
  customIntents: string;
}

export interface SkillOutput {
  interactionModel: string;
  lambdaCode: string;
  skillGuide: string;
  rawText?: string;
}

export type EchoState = "idle" | "listening" | "processing" | "speaking";
