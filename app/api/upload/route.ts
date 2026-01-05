import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'photo', 'document', 'result'
    const entityId = formData.get('entityId') as string; // student ID
    const documentName = formData.get('documentName') as string; // Optional document name

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['photo', 'document', 'result'].includes(type)) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = type === 'photo' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 20MB' 
      }, { status: 400 });
    }

    // Create upload directory structure
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type === 'photo' ? 'photos' : type === 'result' ? 'results' : 'documents');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${entityId || 'file'}_${timestamp}_${randomStr}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/${type === 'photo' ? 'photos' : type === 'result' ? 'results' : 'documents'}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      originalName: documentName || file.name,
      type: type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// DELETE /api/upload - Delete an uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
    }

    // Security: Only allow deleting files from uploads directory
    if (!fileUrl.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const filepath = path.join(process.cwd(), 'public', fileUrl);
    
    // Check if file exists and delete
    if (existsSync(filepath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filepath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
