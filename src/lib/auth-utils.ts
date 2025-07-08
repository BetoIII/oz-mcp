import { auth } from '@/app/auth';
import { prisma } from '@/app/prisma';
import { redirect } from 'next/navigation';

export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export async function requireAuth() {
  try {
    // First check if we can connect to the database
    await prisma.$connect();
    
    // Test database connectivity with a simple query
    await prisma.user.findFirst({ take: 1 });
    
    // Get the user session
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      throw new AuthenticationError('User not authenticated');
    }
    
    return session;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // User not authenticated - redirect to home
      redirect('/');
    }
    
    // Database connection error
    throw new DatabaseConnectionError(
      'Unable to connect to the database. Please try again later.'
    );
  }
}

export async function checkDatabaseHealth() {
  try {
    await prisma.$connect();
    await prisma.user.findFirst({ take: 1 });
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: 'Database connection failed. Please check your database configuration.' 
    };
  }
} 