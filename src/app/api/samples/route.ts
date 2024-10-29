import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const videosDir = join(process.cwd(), "public", "videos");
    const dirs = await readdir(videosDir);
    
    const videos = dirs.filter(dir => 
      dir.match(/^[a-z0-9]{6,}$/) && 
      existsSync(join(videosDir, dir, "final.mp4"))
    );
    
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch samples" }, { status: 500 });
  }
}