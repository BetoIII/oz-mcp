import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/app/prisma';
import { withRetry } from '@/lib/db-retry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Find the authorization code in the database with retry logic
    const authCode = await withRetry(async () => {
      return await prisma.authCode.findUnique({
        where: { code },
        include: {
          client: true
        }
      });
    });

    if (!authCode) {
      return NextResponse.json({ error: 'Invalid authorization code' }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Check if the authorization code has expired
    if (authCode.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Authorization code has expired' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Return the client information needed for the token exchange
    return NextResponse.json({
      clientId: authCode.client.clientId,
      redirectUri: authCode.redirectUri,
      clientSecret: authCode.client.clientSecret,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Error in auth-code-info endpoint:', error);
    
    // Provide more specific error messages for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Can\'t reach database server')) {
      console.error('Database connection failed - the database may be sleeping or have connection issues');
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse("OK", { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 