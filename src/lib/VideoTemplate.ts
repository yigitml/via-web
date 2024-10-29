export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
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
    id: 'short-story',
    name: 'Short Story',
    description: 'Animated story with synchronized text overlay',
    voicePresets: [
      {
        id: 'Ee5YWIlXJUU6vS43Ogfs',
        name: 'Natasha',
        description: 'A valley girl female voice. Great for shorts.',
        languageCode: 'en'
      },
      {
        id: 'FqZouraMcAdBSx0zfXNH',
        name: 'Bria',
        description: 'A young female with a softly spoken tone, perfect for storytelling or ASMR.',
        languageCode: 'en'
      },
      {
        id: 'nsQAxyXwUKBvqtEK9MfK',
        name: 'Denzel',
        description: 'Middle aged American male voice. Perfect for Narrations & Storytelling.',
        languageCode: 'en'
      }
    ],
    style: {
      background: 'video',
      textColor: 'white',
      fontFamily: 'Arial',
      titleAnimation: 'fade'
    },
    promptTemplate: `Create a short video, engaging story that can interest and intrigue the viewer. 
    Format the response as a JSON object with:
    {
      "title": "The main hook or question",
      "content": "The full story text"
    }`
  },
];