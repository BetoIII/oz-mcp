'use client';

import { useState } from 'react';

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string;
  onDelete: (formData: FormData) => void;
}

export default function DeleteClientButton({ 
  clientId, 
  clientName, 
  onDelete 
}: DeleteClientButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (formData: FormData) => {
    if (!confirm(`Are you sure you want to delete "${clientName}"? This will revoke all associated tokens.`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete(formData);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form action={handleDelete} className="inline">
      <input type="hidden" name="clientId" value={clientId} />
      <button
        type="submit"
        disabled={isDeleting}
        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Delete Client'}
      </button>
    </form>
  );
} 