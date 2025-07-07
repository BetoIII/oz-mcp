'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string;
}

export default function DeleteClientButton({ 
  clientId, 
  clientName 
}: DeleteClientButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (formData: FormData) => {
    if (!confirm(`Are you sure you want to delete "${clientName}"? This will revoke all associated tokens.`)) {
      return;
    }
    
    setIsDeleting(true);
    // The form submission will be handled by the server action
    // The setIsDeleting state will be reset when the page redirects
  };

  return (
    <form action={handleDelete} className="inline">
      <input type="hidden" name="clientId" value={clientId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        className="h-7 w-7 p-0"
      >
        <Trash2 className="h-3 w-3" />
        <span className="sr-only">Delete {clientName}</span>
      </Button>
    </form>
  );
} 