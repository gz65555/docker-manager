import { NextRequest, NextResponse } from 'next/server';
import { restartContainer } from '@/lib/docker-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const containerId = params.id;
    await restartContainer(containerId);
    
    return NextResponse.json(
      { success: true, message: 'Container restarted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error restarting container:', error);
    return NextResponse.json(
      { error: 'Failed to restart container' },
      { status: 500 }
    );
  }
} 