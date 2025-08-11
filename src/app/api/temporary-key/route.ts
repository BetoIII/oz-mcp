import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Create a temporary access token that expires in 24 hours and allows 5 requests
    const tempToken = `temp_${randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create or find anonymous user for temporary tokens
    let anonymousUser = await prisma.user.findFirst({
      where: { email: 'anonymous@temp.local' }
    });

    if (!anonymousUser) {
      anonymousUser = await prisma.user.create({
        data: {
          email: 'anonymous@temp.local',
          name: 'Anonymous Temporary User',
        },
      });
    }

    // Create a temporary client if one doesn't exist
    let tempClient = await prisma.client.findFirst({
      where: { name: 'Temporary Playground Client' }
    });

    if (!tempClient) {
      tempClient = await prisma.client.create({
        data: {
          name: 'Temporary Playground Client',
          redirectUris: [`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/playground`],
          clientSecret: randomBytes(32).toString('hex'),
          userId: anonymousUser.id,
        },
      });
    }

    // Create the temporary access token with usage tracking
    await prisma.accessToken.create({
      data: {
        token: tempToken,
        expiresAt,
        clientId: tempClient.id,
        userId: anonymousUser.id,
        // We'll track usage count in a separate mechanism
      },
    });

    return NextResponse.json({
      success: true,
      token: tempToken,
      expiresAt: expiresAt.toISOString(),
      usageLimit: 5,
      message: 'Temporary API key created successfully. Valid for 24 hours and 5 requests.',
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Error creating temporary API key:', error);
    return NextResponse.json({
      error: 'Failed to create temporary API key',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OZ-Extension',
    }
  });
} 