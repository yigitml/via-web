import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { exec } from 'child_process';
import { promisify } from 'util';
import { Transcription } from "@/types";

const execAsync = promisify(exec);

export class VideoBuilder {
  private readonly id: string;
  private readonly dir: string;
  private readonly BACKGROUND_DURATION = 60; // Assuming background video is 60 seconds long

  constructor(id: string) {
    this.id = id;
    this.dir = join(process.cwd(), "public", "videos", id);
  }

  private generateTextFilter(word: any, index: number): string {
    const text = word.word.replace(/'/g, "'\\''")
                         .replace(/[\[\]]/g, '\\$&')
                         .replace(/[\n\r]/g, ' ');
    const start = parseFloat(word.start);
    const end = parseFloat(word.end);
    const prevIndex = index > 0 ? `v${index-1}` : 'bg';
    
    const baseConfig = `fontfile=./public/fonts/LuckiestGuy-Regular.ttf:fontcolor=white:bordercolor=black:borderw=5`;
    
    if ('isTitle' in word) {
      return `[${prevIndex}]drawtext=text='${text}':${baseConfig}:fontsize='if(lt(t,${start}+0.3),120*(1+(t-${start})*0.1),if(gt(t,${end}-0.2),120*(1-(t-(${end}-0.2))*0.15),120*1.03))':x=(w-text_w)/2:y=(h/3-text_h)/2:enable='between(t,${start},${end})'[v${index}]`;
    }
    
    return `[${prevIndex}]drawtext=text='${text}':${baseConfig}:fontsize='if(lt(t,${start}+0.2),90*(1+(t-${start})*0.1),if(gt(t,${end}-0.15),90*(1-(t-(${end}-0.15))*0.12),90*1.02))':x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${start},${end})'[v${index}]`;
  }

  private getRandomStartTime(duration: number): number {
    // Ensure we don't start too close to the end of the background video
    const maxStart = this.BACKGROUND_DURATION - duration;
    return Math.random() * maxStart;
  }

  private buildFFmpegCommand(inputPath: string, outputPath: string, filterContent: string, duration: number, wordCount: number): string {
    const startTime = this.getRandomStartTime(duration);
    
    return `ffmpeg -y \
      -i "${join(process.cwd(), "public", "background.mp4")}" \
      -i "${inputPath}" \
      -filter_complex "\
      [0:v]scale=3413:1920,crop=1080:1920:1166:0,setpts=PTS-STARTPTS,trim=start=${startTime}:duration=${duration},setpts=PTS-STARTPTS[bg];\
      ${filterContent}" \
      -map "[v${wordCount-1}]" \
      -map 1:a \
      -c:v libx264 -preset ultrafast \
      -c:a aac \
      -pix_fmt yuv420p \
      -shortest \
      "${outputPath}"`;
  }

  public async build(): Promise<string> {
    if (!existsSync(this.dir)) {
      throw new Error("Story directory not found");
    }

    // Read and parse transcription
    const transcriptionPath = join(this.dir, "voiceover-1.txt");
    const transcriptionData: Transcription = JSON.parse(await readFile(transcriptionPath, "utf8"));

    // Generate filter content
    const textFilters = transcriptionData.words.map((word, index) => 
      this.generateTextFilter(word, index)).join(';\n');

    // Write filter file
    const filterPath = join(this.dir, "filter.txt");
    await writeFile(filterPath, textFilters);

    // Build and execute FFmpeg command
    const command = this.buildFFmpegCommand(
      join(this.dir, "voiceover-1.mp3"),
      join(this.dir, "final.mp4"),
      textFilters,
      parseFloat(transcriptionData.duration) + 2,
      transcriptionData.words.length
    );

    console.log('Executing FFmpeg command:', command);
    const { stderr } = await execAsync(command);
    
    if (stderr) {
      console.log('FFmpeg stderr:', stderr);
    }

    return `/videos/${this.id}/final.mp4`;
  }
}
