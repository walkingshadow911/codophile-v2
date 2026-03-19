import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Effect from '@/lib/models/Effect';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    
    // Validate pagination parameters
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 9;
    const skip = (validPage - 1) * validLimit;

    await connectToDatabase();
    
    // Only fetch published effects
    const query = { isPublished: true };
    
    const [effects, total] = await Promise.all([
      Effect.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit)
        .lean(),
      Effect.countDocuments(query)
    ]);
    
    return NextResponse.json({ 
      effects, 
      pagination: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching public effects:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
