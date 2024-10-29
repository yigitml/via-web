import { ElevenLabsTTSService } from './tts/ElevenLabsTTSService';
import { TimestampResponse } from '@/types/elevenlabs';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { videoTemplates } from './VideoTemplate';
import type { Transcription } from '@/types';

export class VideoAssetGenerator {
  private tts: ElevenLabsTTSService;

  constructor() {
    this.tts = new ElevenLabsTTSService();
    console.info('VideoAssetGenerator initialized');
  }

  private async generateShortStoryStyle(text: string): Promise<{
    title: string;
    content: string;
  }> {
    try {
      const parsed = JSON.parse(text);
      console.debug('Successfully parsed short story style content', { title: parsed.title });
      return {
        title: parsed.title || 'Untitled',
        content: parsed.content || text
      };
    } catch {
      console.warn('Failed to parse short story style content, using default format');
      return {
        title: 'Short Story',
        content: text
      };
    }
  }

  private async generateVoiceovers(script: { text: string, voice: string, languageCode?: string }, outputPath: string) {
    try {
      console.info('Starting audio asset generation', { outputPath });
      const { title, content } = await this.generateShortStoryStyle(script.text);
      const contentText = typeof content === 'object' ? JSON.stringify(content) : content;
      
      if (!script.voice) {
        console.error('Voice ID missing');
        throw new Error('Voice ID is required for generating audio assets');
      }

      console.debug('Generating speech with ElevenLabs timestamps', { 
        textLength: contentText.length,
        voice: script.voice 
      });
      
      const response: TimestampResponse = await this.tts.generateSpeechWithTimestamps({
        text: contentText,
        voice: script.voice,
        modelId: 'eleven_turbo_v2_5',
        outputFormat: 'mp3_44100_128',
        ...(script.languageCode && { language_code: script.languageCode })
      });

      // Check for the correct response properties
      if (!response?.audio_base64 || !response.alignment?.characters?.length) {
        console.error('Invalid response from ElevenLabs:', {
          response,
          hasAudio: !!response?.audio_base64,
          hasAlignment: !!response?.alignment
        });
        throw new Error('Invalid or missing data from ElevenLabs API');
      }

      console.debug('Writing audio file');
      const base64Data = response.audio_base64.includes(',') 
        ? response.audio_base64.split(',')[1] 
        : response.audio_base64;
      
      const audioData = Buffer.from(base64Data, 'base64');
      const audioPath = join(outputPath, 'voiceover-1.mp3');
      await writeFile(audioPath, audioData);

      // Convert character-level timestamps to word-level timestamps
      console.debug('Processing word timings from API response');
      const words = this.processTimestampsToWords(
        response.alignment.characters,
        response.alignment.character_start_times_seconds,
        response.alignment.character_end_times_seconds,
        contentText
      );
      
      const titleTiming = {
        word: title,
        start: "0.00",
        end: "2.00",
        isTitle: true
      };

      const transcription = {
        duration: response.alignment.character_end_times_seconds[response.alignment.character_end_times_seconds.length - 1].toFixed(2),
        words: [titleTiming, ...words]
      };

      console.debug('Writing transcription file');
      await writeFile(
        join(outputPath, 'voiceover-1.txt'),
        JSON.stringify(transcription, null, 2)
      );

      console.info('Audio asset generation completed successfully');
    } catch (error: any) {
      console.error('Error generating audio assets', { 
        error: error.message,
        stack: error.stack,
        originalError: error
      });
      throw error;
    }
  }

  // Helper function to convert character-level timestamps to word-level
  private processTimestampsToWords(
    characters: string[],
    startTimes: number[],
    endTimes: number[],
    originalText: string
  ): Transcription['words'] {
    const words = originalText.split(/\s+/);
    const result: Transcription['words'] = [];
    let charIndex = 0;

    for (const word of words) {
      // Add safety checks
      if (charIndex >= startTimes.length) {
        console.warn('Character index exceeded timestamp array length', {
          charIndex,
          timestampsLength: startTimes.length
        });
        break;
      }

      // Get the start time of the first character of the word
      const wordStart = startTimes[charIndex] || 0;
      
      // Find the matching characters in the API response
      while (charIndex < characters.length && 
             charIndex < startTimes.length &&  // Add this check
             characters.slice(charIndex, charIndex + word.length).join('').toLowerCase() !== word.toLowerCase()) {
        charIndex++;
      }
      
      // Move to the end of the word
      charIndex += word.length;
      
      // Skip any whitespace
      while (charIndex < characters.length && characters[charIndex] === ' ') {
        charIndex++;
      }
      
      // Get the end time with safety check
      const endIndex = Math.min(charIndex - 1, endTimes.length - 1);
      const wordEnd = endTimes[endIndex] || wordStart;  // Fallback to wordStart if no end time
      
      result.push({
        word,
        start: (wordStart || 0).toFixed(2),
        end: (wordEnd || wordStart).toFixed(2)
      });
    }

    return result;
  }

  async generateVideoAssets({ 
    content, 
    templateId, 
    voiceId 
  }: { 
    content: string; 
    templateId: string; 
    voiceId: string; 
  }): Promise<string> {
    const id = Math.random().toString(36).substring(2, 8);
    console.info('Starting video asset generation', { id, templateId });

    try {
      const outputPath = join(process.cwd(), 'public', 'videos', id);
      await mkdir(outputPath, { recursive: true });

      const template = videoTemplates.find(t => t.id === templateId);
      if (!template) {
        console.error('Invalid template ID provided', { templateId });
        throw new Error('Invalid template ID');
      }

      console.log('template', template.voicePresets[1].languageCode);

      await this.generateVoiceovers(
        { text: content.toString(), voice: voiceId, languageCode: template.voicePresets[1].languageCode }, 
        outputPath
      );

      console.info('Video asset generation completed', { id });
      return id;
    } catch (error: any) {
      console.error('Video asset generation failed', {
        id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}
