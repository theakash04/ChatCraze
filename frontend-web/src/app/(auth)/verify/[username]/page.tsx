"use client";

import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OTPFormValues } from "@/types/otpFrom";
import { otpSchema } from "@/model/otpSchema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const username = usePathname().split("/").pop();
  const router = useRouter();

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (isNaN(Number(value))) {
      e.target.value = "";
    }
  }

  const onSubmit = async (data: OTPFormValues) => {
    setIsSubmitting(true);
    const otp = data.otp;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/verify`,
        { username, otp },
      );
      toast({
        title: response.data.message,
      });
      router.replace(`/chat`);
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        AxiosError.response?.data.message || "Submission failed";
      toast({
        title: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center pt-40 bg-background mx-5">
      <div className="w-full max-w-md p-8 space-y-8 bg-primary-foreground rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your OTP
          </h1>
          <p className="mb-4">Enter the OTP sent to your email!</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 flex items-center justify-center flex-col"
          >
            <FormField
              name="otp"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      inputMode="tel"
                      maxLength={6}
                      placeholder="eg: 231412"
                      className="w-52 h-12 text-center"
                      autoFocus
                      onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInput(e)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                size={"lg"}
                disabled={isSubmitting}
                className="font-bold text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;
