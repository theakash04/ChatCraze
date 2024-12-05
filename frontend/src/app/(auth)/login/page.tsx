'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpSchema } from '@/model/signUpSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@/model/loginSchema';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import useHash from '@/lib/hashPass';

function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      data.password = await useHash(data.password);
      const response = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/login`,
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true,
        }
      );

      const { username, accessToken } = response.data?.data as {
        username: string;
        accessToken: string;
      };

      // setting access token to localStorage
      localStorage.setItem('accessToken', accessToken as string);
      toast({
        title: response.data.message,
      });
      router.replace(`/chat/${username}`);
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse>;
      const errorMessage = AxiosError.response?.data.message;
      toast({
        title: errorMessage || 'Something went wrong!',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-background mx-5">
      <div className="w-full max-w-md p-8 space-y-8 bg-primary-foreground rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Welcome back
          </h1>
          <p className="mb-4">Where have you been?</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PotatoNinja123"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant={'default'}
                size={'lg'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />{' '}
                    Submitting....
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Don&apos;t have an Account?{' '}
            <Link
              href="/sign-up"
              className="text-ring hover:text-blue-600 text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page;
