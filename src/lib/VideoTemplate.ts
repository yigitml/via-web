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
        name: 'Female',
        description: 'A female voice with a British accent',
        languageCode: 'en'
      },
      {
        id: 'MIyORLtrtKBPcRoq8h52',
        name: 'Sultan',
        description: '',
        languageCode: 'tr'
      }
    ],
    style: {
      background: 'video', // or 'video', 'pattern'
      textColor: 'white',
      fontFamily: 'Arial',
      titleAnimation: 'fade' // or 'slide', 'zoom'
    },
    promptTemplate: `Create a short, engaging story that can be told in under 60 seconds. 
    Format the response as a JSON object with:
    {
      "title": "The main hook or question",
      "content": "The full story text"
    }`
  },
  // ... other existing templates
];