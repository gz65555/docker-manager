import { NextRequest, NextResponse } from 'next/server';
import { removeContainer } from '@/lib/docker-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const containerId = params.id;
    await removeContainer(containerId);
    
    return NextResponse.json(
      { success: true, message: 'Container removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing container:', error);
    return NextResponse.json(
      { error: 'Failed to remove container' },
      { status: 500 }
    );
  }
} 