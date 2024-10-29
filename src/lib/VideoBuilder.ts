import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { exec } from 'child_process';
import { promisify } from 'util';
import { Transcription } from "@/types";

const execAsync = promisify(exec);

interface WordWindow {
  words: Array<{
    word: string;
    start: number;
    end: number;
    isCurrent: string | boolean;
  }>;
  start: number;
  end: number;
}

export class VideoBuilder {
  private readonly id: string;
  private readonly dir: string;
  private readonly BACKGROUND_DURATION = 60;
  private readonly WORD_WINDOW_TIME = 0.5;
  private readonly MAX_WORDS_VISIBLE = 3;
  private readonly MIN_WORDS_VISIBLE = 1;

  constructor(id: string) {
    this.id = id;
    this.dir = join(process.cwd(), "public", "videos", id);
  }

  private getRandomStartTime(duration: number): number {
    const maxStart = this.BACKGROUND_DURATION - duration;
    return Math.random() * maxStart;
  }

  private calculateWordWindows(words: any[]): WordWindow[] {
    const windows: WordWindow[] = [];
    let currentWindow: WordWindow = {
      words: [],
      start: 0,
      end: 0
    };

    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];
      const start = parseFloat(currentWord.start);
      const end = parseFloat(currentWord.end);

      if (
        currentWindow.words.length === 0 ||
        start - currentWindow.words[0].start > this.WORD_WINDOW_TIME ||
        currentWindow.words.length >= this.MAX_WORDS_VISIBLE
      ) {
        if (currentWindow.words.length > 0) {
          if (currentWindow.words.length < this.MIN_WORDS_VISIBLE && i < words.length) {
            const nextWords = words.slice(i, i + (this.MIN_WORDS_VISIBLE - currentWindow.words.length));
            currentWindow.words.push(...nextWords.map(w => ({
              word: w.word,
              start: parseFloat(w.start),
              end: parseFloat(w.end),
              isCurrent: false
            })));
          }
          windows.push(currentWindow);
        }

        currentWindow = {
          words: [{
            word: currentWord.word,
            start,
            end,
            isCurrent: true
          }],
          start,
          end
        };
      } else {
        currentWindow.words.push({
          word: currentWord.word,
          start,
          end,
          isCurrent: true
        });
      }

      currentWindow.words.forEach(word => {
        word.isCurrent = `between(t,${word.start},${word.end})`;
      });

      currentWindow.end = end;
    }

    if (currentWindow.words.length > 0) {
      windows.push(currentWindow);
    }

    return windows;
  }

  private generateTextFilter(window: WordWindow, index: number): string {
    const currentLabel = `text${index}`;
    const prevLabel = index === 0 ? 'bg' : `text${index-1}`;
    
    const baseConfig = 'fontfile=./public/fonts/LuckiestGuy-Regular.ttf:bordercolor=black:borderw=5';
    const yOffset = `(h-text_h*${window.words.length})/2`;
    
    const wordFilters = window.words.map((word, wordIndex) => {
      const text = word.word.replace(/'/g, "'\\''")
                          .replace(/[\[\]]/g, '\\$&')
                          .replace(/[\n\r]/g, ' ')
                          .toUpperCase();
      
      const enableExpr = `between(t,${window.start},${window.end})`;
      const isCurrentExpr = word.isCurrent.toString();
      
      const currentWordFilter = `drawtext=text='${text}':${baseConfig}:` +
                                `fontsize=90:x=(w-text_w)/2:` +
                                `y=${yOffset}+${wordIndex}*120:` +
                                `enable='${enableExpr}*${isCurrentExpr}':` +
                                `fontcolor=red:` +
                                `alpha=1`;

      const nonCurrentWordFilter = `drawtext=text='${text}':${baseConfig}:` +
                                   `fontsize=90:x=(w-text_w)/2:` +
                                   `y=${yOffset}+${wordIndex}*120:` +
                                   `enable='${enableExpr}*not(${isCurrentExpr})':` +
                                   `fontcolor=white:` +
                                   `alpha=1`;

      return `${currentWordFilter},${nonCurrentWordFilter}`;
    });

    return `[${prevLabel}]${wordFilters.join(',')}[${currentLabel}]`;
  }

  private buildFFmpegCommand(inputPath: string, outputPath: string, filterContent: string, duration: number, windowCount: number): string {
    const startTime = this.getRandomStartTime(duration);
    const finalLabel = `text${windowCount-1}`;
    
    return `ffmpeg -y \
          -i "${join(process.cwd(), "public", "background.mp4")}" \
          -i "${inputPath}" \
          -filter_complex \
          "[0:v]scale=3413:1920,crop=1080:1920:1166:0,setpts=PTS-STARTPTS,trim=start=${startTime}:duration=${duration},setpts=PTS-STARTPTS[bg];\
          ${filterContent}" \
          -map "[${finalLabel}]" \
          -map 1:a \
          -c:v libx264 -preset ultrafast \
          -c:a aac \
          -pix_fmt yuv420p \
          -shortest \
          "${outputPath}"`.replace(/\s+/g, ' ').trim();
  }

  public async build(): Promise<string> {
    if (!existsSync(this.dir)) {
      throw new Error("Video directory not found");
    }

    const transcriptionPath = join(this.dir, "voiceover-1.txt");
    const transcriptionData: Transcription = JSON.parse(await readFile(transcriptionPath, "utf8"));

    const windows = this.calculateWordWindows(transcriptionData.words);

    const textFilters = windows.map((window, index) => 
      this.generateTextFilter(window, index)).join(';\n');

    const filterPath = join(this.dir, "filter.txt");
    await writeFile(filterPath, textFilters);

    const command = this.buildFFmpegCommand(
      join(this.dir, "voiceover-1.mp3"),
      join(this.dir, "final.mp4"),
      textFilters,
      parseFloat(transcriptionData.duration) + 2,
      windows.length
    );

    try {
      const { stderr } = await execAsync(command);
      if (stderr) {
        console.log('FFmpeg stderr:', stderr);
      }
    } catch (error) {
      console.error('FFmpeg error:', error);
    }

    return `/videos/${this.id}/final.mp4`;
  }
}