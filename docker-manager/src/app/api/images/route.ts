import { NextResponse } from 'next/server';
import { listImages } from '@/lib/docker-service';

export async function GET() {
  try {
    const images = await listImages();
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
} 