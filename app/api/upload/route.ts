import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloudinary, getCloudinaryPublicIdFromUrl, isCloudinaryConfigured } from '@/lib/cloudinary';

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

function getUploadFolder(type: string): string {
  switch (type) {
    case 'photo':
      return 'adventhope/photos';
    case 'result':
      return 'adventhope/results';
    default:
      return 'adventhope/documents';
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.' },
        { status: 500 }
      );
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

    // Convert file to buffer and upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: getUploadFolder(type),
      public_id: `${entityId || 'file'}_${timestamp}_${randomStr}`,
      resource_type: type === 'photo' ? 'image' : 'auto',
      overwrite: false,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      filename: uploadResult.public_id,
      publicId: uploadResult.public_id,
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

    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    const publicIdFromParam = searchParams.get('publicId');

    if (!fileUrl && !publicIdFromParam) {
      return NextResponse.json({ error: 'No file URL or publicId provided' }, { status: 400 });
    }

    const publicId = publicIdFromParam || (fileUrl ? getCloudinaryPublicIdFromUrl(fileUrl) : null);

    if (!publicId) {
      return NextResponse.json({ error: 'Invalid Cloudinary file reference' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });

    if (result.result === 'not found') {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
        invalidate: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
