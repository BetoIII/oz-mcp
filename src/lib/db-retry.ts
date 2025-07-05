/**
 * Helper function to retry database operations with exponential backoff
 * Useful for handling connection issues with serverless databases like Neon
 */
export async function retryDbOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if this is a database connection error that we should retry
      const isRetryableError = errorMessage.includes('Can\'t reach database server') ||
                              errorMessage.includes('connection') ||
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('ECONNREFUSED') ||
                              errorMessage.includes('ENOTFOUND') ||
                              errorMessage.includes('ETIMEDOUT');
      
      if (isRetryableError && i < maxRetries - 1) {
        console.log(`Database operation attempt ${i + 1} failed, retrying in ${delay}ms...`);
        console.log(`Error: ${errorMessage}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Max database retries exceeded');
}

/**
 * Wrapper for Prisma operations that automatically retries on connection failures
 */
export function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  return retryDbOperation(operation);
} 