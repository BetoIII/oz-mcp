'use client';

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DatabaseErrorProps {
  message: string;
}

export function DatabaseError({ message }: DatabaseErrorProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-red-700">Database Connection Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>This usually means:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>The database server is temporarily unavailable</li>
              <li>Network connectivity issues</li>
              <li>Database configuration problems</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
              Go to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 