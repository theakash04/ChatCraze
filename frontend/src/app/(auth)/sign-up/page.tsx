'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpSchema } from '@/model/signUpSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { Loader2 } from 'lucide-react';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import HashPass from '@/lib/hashPass';

function Page() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 300);
  const { toast } = useToast();
  const router = useRouter();

  // zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsername = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_API}/checkUsername?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const AxiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            AxiosError.response?.data.message ??
              'username shuld be greater than 3'
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    // Only run the username check after the component is mounted
    checkUsername();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      data.password = await HashPass(data.password);
      const response = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/signUp`,
        data
      );
      toast({
        title: 'Success',
        description: response.data.message,
      });
      router.replace(`/verify/${username}`);
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse>;
      const errorMessage = AxiosError.response?.data.message;
      toast({
        title: 'Signup failed',
        description: errorMessage,
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
            Join ChatCraze
          </h1>
          <p className="mb-4">SignUp to chat freely with others!</p>
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
                        debounced(e.target.value);
                      }}
                      autoFocus
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  <p
                    className={`text-sm ${
                      usernameMessage == 'Username Available'
                        ? 'text-chart-2'
                        : 'text-destructive'
                    }`}
                  >
                    {usernameMessage}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@akashtwt.com" {...field} />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />{' '}
                    Submitting....
                  </>
                ) : (
                  'Signup'
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link
              href="/login"
              className="text-ring text-blue-500 hover:text-blue-600"
            >
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page;
