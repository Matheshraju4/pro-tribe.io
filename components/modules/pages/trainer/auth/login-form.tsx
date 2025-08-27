"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  FileText,
  Star,
  Smartphone,
} from "lucide-react";
import { trainerLoginSchema } from "@/lib/schemas/auth";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof trainerLoginSchema>>({
    resolver: zodResolver(trainerLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange", // This will validate as user types
  });

  async function onSubmit(values: z.infer<typeof trainerLoginSchema>) {
    try {
      setIsLoading(true);

      const response = await axios.post("/api/auth/trainer/login", values);
      if (response.status === 200) {
        toast.success("Login successfull!");

        router.push("/trainer/dashboard");
      } else {
        toast.error("Failed to login. Please try again.");
      }
    } catch (error) {
      console.error("Login error", error);
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 order-2 lg:order-1">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mr-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full"></div>
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              ProTribe
            </span>
          </div>

          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Welcome back
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-sm mx-auto">
              Sign in to your ProTribe account to continue your fitness journey
            </p>
          </div>

          {/* Social Login Options */}
          <div className="mb-6 sm:mb-8">
            <div className="w-full mb-4">
              <Button
                variant="outline"
                className="w-full h-11 sm:h-12 border-gray-300 hover:bg-gray-50 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  or continue with email
                </span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="h-11 sm:h-12 pl-9 sm:pl-10 border-gray-300 focus:border-primary focus:ring-primary text-sm sm:text-base"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          className="h-11 sm:h-12 pl-9 sm:pl-10 pr-10 border-gray-300 focus:border-primary focus:ring-primary text-sm sm:text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-gray-600 font-normal">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <a
                  href="/trainer/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          {/* Sign Up Link */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm sm:text-base text-gray-600">
              Don't have an account?{" "}
              <a
                href="/trainer/signup"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Promotional Content (Hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden order-1 lg:order-2">
        {/* Background Circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-primary/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/10 rounded-full"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center text-white px-12">
          {/* App Icons */}
          <div className="mb-8">
            <div className="flex flex-col space-y-4 items-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 w-80">
            <div className="flex items-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/60 rounded-full"></div>
                <div className="flex-1 h-3 bg-white/30 rounded"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-3 bg-primary/60 rounded-full"></div>
                <div className="flex-1 h-3 bg-white/30 rounded"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/60 rounded-full"></div>
                <div className="flex-1 h-3 bg-white/30 rounded"></div>
              </div>
            </div>
          </div>

          {/* Headlines */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Welcome back to ProTribe
            </h2>
            <p className="text-xl text-primary/90">
              Access your fitness dashboard and continue building your business.
            </p>
          </div>

          {/* Pagination Dots */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
