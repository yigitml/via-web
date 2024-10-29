export interface Transcription {
  duration: string;
  words: {
    word: string;
    start: string;
    end: string;
  }[];
}
