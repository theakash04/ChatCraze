import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Chatcraze
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Connect, collaborate, and communicate in real-time
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" size="lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
