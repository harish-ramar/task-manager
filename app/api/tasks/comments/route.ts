import { NextRequest, NextResponse } from 'next/server';
import { addTaskComment } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, comment } = body;
    
    if (!taskId || !comment) {
      return NextResponse.json(
        { error: 'Task ID and comment are required' },
        { status: 400 }
      );
    }
    
    const newComment = await addTaskComment(taskId, comment);
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
