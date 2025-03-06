import { NextRequest, NextResponse } from 'next/server';
import { stopContainer } from '@/lib/docker-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const containerId = params.id;
    await stopContainer(containerId);
    
    return NextResponse.json(
      { success: true, message: 'Container stopped successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error stopping container:', error);
    return NextResponse.json(
      { error: 'Failed to stop container' },
      { status: 500 }
    );
  }
} 