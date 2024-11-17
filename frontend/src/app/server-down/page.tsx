'use client';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="flex w-full h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-full p-6 inline-block shadow-lg">
          <ServerCrash className="h-24 w-24 text-red-500 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Server is Down
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto">
            We&apos;re experiencing technical difficulties. Our team is working
            hard to get things back up and running.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => window.location.replace('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
