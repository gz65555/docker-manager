import { NextResponse } from 'next/server';
import { listContainers } from '@/lib/docker-service';

export async function GET() {
  try {
    const containers = await listContainers(true);
    
    return NextResponse.json(containers);
  } catch (error) {
    console.error('Error fetching containers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch containers' },
      { status: 500 }
    );
  }
} 