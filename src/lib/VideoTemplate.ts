export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  segments: number;
  promptTemplate: string;
  voicePresets: {
    id: string;
    name: string;
    description: string;
    languageCode?: string;
  }[];
  style?: {
    background: string;
    textColor: string;
    fontFamily: string;
    titleAnimation?: string;
  };
}

export const videoTemplates: VideoTemplate[] = [
  {
    id: 'tiktok-story',
    name: 'TikTok Story',
    description: 'Animated story with synchronized text overlay',
    segments: 1, // Single segment for continuous flow
    voicePresets: [
      {
        id: 'MIyORLtrtKBPcRoq8h51',
        name: 'Natasha',
        description: 'A valley girl female voice. Great for shorts.',
        languageCode: 'en'
      },
      {
        id: 'u6aeqVRWb4h0VkhpUkLL',
        name: 'Bria',
        description: 'A young female with a softly spoken tone, perfect for storytelling or ASMR.',
        languageCode: 'en'
      }
    ],
    style: {
      background: 'video', // or 'video', 'pattern'
      textColor: 'white',
      fontFamily: 'Arial',
      titleAnimation: 'fade' // or 'slide', 'zoom'
    },
    promptTemplate: `Create a short video, engaging story that can interest and intrigue the viewer. 
    Format the response as a JSON object with:
    {
      "title": "The main hook or question",
      "content": "The full story text"
    }`
  },
  // ... other existing templates
];