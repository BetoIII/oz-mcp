import { requireAuth, DatabaseConnectionError } from '@/lib/auth-utils';
import { DatabaseError } from '@/components/DatabaseError';
import PlaygroundClient from './PlaygroundClient';

export default async function PlaygroundPage() {
  try {
    const session = await requireAuth();
  } catch (error) {
    if (error instanceof DatabaseConnectionError) {
      return <DatabaseError message={error.message} />;
    }
    // Other errors will be handled by requireAuth (redirects, etc.)
    throw error;
  }

  return <PlaygroundClient />;
}