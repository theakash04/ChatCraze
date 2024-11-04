"use client";

import { usePathname } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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

function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
  });

  const onSubmit = async (data: OTPFormValues) => {
    const username = usePathname().split("/").pop();
    setIsSubmitting(true);
    const otp = data.otp.join("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/verify`,
        { username, otp }
      );
      toast({
        title: "Success",
        description: response.data.message,
      });
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        AxiosError.response?.data.message || "Submission failed";
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-background mx-5">
      <div className="w-full max-w-md p-8 space-y-8 bg-secondary rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your OTP
          </h1>
          <p className="mb-4">Enter the OTP sent to your email!</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Controller
                key={index}
                name={`otp.${index}`}
                control={form.control}
                render={({ field }) => (
                  <Input
                    type="text"
                    maxLength={1}
                    {...field}
                    className="w-12 text-center"
                    onChange={(e) => {
                      // Only allow one character input
                      if (e.target.value.length <= 1) {
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-center">
            <Button
              type="submit"
              size={"lg"}
              disabled={isSubmitting}
              className="font-bold text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-4 w-4 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Page;
