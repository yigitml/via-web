export interface VoiceSettings {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  }
  
export interface TTSOptions {
    text: string;
    voice?: string;
    modelId?: string;
    voiceSettings?: VoiceSettings;
    outputFormat?: string;
    optimizeStreamingLatency?: number;
    languageCode?: string;
}
  
export interface TimestampResponse {
    audio_base64: string;
    alignment: {
      characters: string[];
      character_start_times_seconds: number[];
      character_end_times_seconds: number[];
    };
}
  
export interface ElevenLabsResponse {
    audio_base64: string;
    alignment: {
      chars: string[];
      start_times: number[];
      end_times: number[];
    };
    normalized_alignment: {
      chars: string[];
      start_times: number[];
      end_times: number[];
    };
}