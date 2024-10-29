import axios from 'axios';
import { TTSOptions, TimestampResponse } from '@/types/elevenlabs';

export class ElevenLabsTTSService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private defaultVoiceId: string;

  constructor() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'MIyORLtrtKBPcRoq8h51';

    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is required');
    }

    if (!defaultVoiceId) {
      throw new Error('ELEVENLABS_DEFAULT_VOICE_ID is required');
    }

    this.apiKey = apiKey;
    this.defaultVoiceId = defaultVoiceId;
    console.debug('Initialized ElevenLabs TTS with voice ID:', this.defaultVoiceId);
  }

  async generateSpeech(options: TTSOptions): Promise<string> {
    try {
      const voiceId = options.voice || this.defaultVoiceId;
      
      if (!voiceId) {
        throw new Error('Voice ID is required');
      }

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: options.text,
          model_id: options.modelId || 'eleven_monolingual_v1',
          voice_settings: options.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.5
          },
          output_format: options.outputFormat || 'mp3_44100_128',
          ...(options.languageCode && { language_code: options.languageCode }),
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer',
          params: {
            ...(options.optimizeStreamingLatency !== undefined && {
              optimize_streaming_latency: options.optimizeStreamingLatency
            })
          }
        }
      );

      const audioBase64 = Buffer.from(response.data).toString('base64');
      return `data:audio/mpeg;base64,${audioBase64}`;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data 
          ? Buffer.from(error.response.data).toString()
          : error.message;

        if (error.response?.status === 404) {
          throw new Error(`Voice ID not found: ${options.voice}`);
        }
        if (error.response?.status === 422) {
          throw new Error(`Invalid request: ${errorMessage}`);
        }
        throw new Error(`ElevenLabs API error: ${errorMessage}`);
      }
      throw error;
    }
  }

  async generateSpeechWithTimestamps(options: TTSOptions): Promise<TimestampResponse> {
    const voiceId = options.voice || this.defaultVoiceId;
    console.debug('Using voice ID:', voiceId);

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
        {
          text: options.text,
          model_id: options.modelId || "eleven_turbo_v2_5",
          output_format: options.outputFormat || "mp3_44100_128"
        },
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('ElevenLabs API error:', error.response?.data || error.message);
      throw error;
    }
  }
}
