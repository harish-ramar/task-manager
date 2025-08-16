import { NextRequest, NextResponse } from 'next/server';
import { addTaskMedia, deleteTaskMedia } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const taskId = formData.get('taskId') as string;
    const file = formData.get('file') as File;
    
    if (!taskId || !file) {
      return NextResponse.json(
        { error: 'Task ID and file are required' },
        { status: 400 }
      );
    }
    
    // For now, we'll store a simple file reference
    // In a production app, you'd upload to cloud storage
    const mediaData = {
      fileName: file.name,
      fileType: file.type,
      fileUrl: `/uploads/${file.name}`, // This would be the actual uploaded file URL
      fileSize: file.size,
    };
    
    const newMedia = await addTaskMedia(parseInt(taskId), mediaData);
    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');
    
    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }
    
    await deleteTaskMedia(parseInt(mediaId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
