import { NextRequest, NextResponse } from 'next/server';
import { startContainer } from '@/lib/docker-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const containerId = params.id;
    await startContainer(containerId);
    
    return NextResponse.json(
      { success: true, message: 'Container started successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error starting container:', error);
    return NextResponse.json(
      { error: 'Failed to start container' },
      { status: 500 }
    );
  }
} 