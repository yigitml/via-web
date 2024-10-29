import { NextResponse } from 'next/server';
import { VideoAssetGenerator } from '@/lib/VideoAssetGenerator';
import { VideoBuilder } from '@/lib/VideoBuilder';

export async function POST(request: Request) {
  try {
    const { content, templateId, voiceId } = await request.json();
    
    if (!content || !templateId) {
      return NextResponse.json(
        { error: 'URL and template ID are required' }, 
        { status: 400 }
      );
    }

    const generator = new VideoAssetGenerator();
    
    const videoId = await generator.generateVideoAssets({
      content,
      templateId,
      voiceId,
    });

    const videoBuilder = new VideoBuilder(videoId);
    const url = await videoBuilder.build();

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Create video error', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}