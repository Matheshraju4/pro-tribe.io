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
  Users,
  Building2,
  Smartphone,
} from "lucide-react";
import { trainerSignupSchema, TrainerSignupInput } from "@/lib/schemas/auth";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof trainerSignupSchema>>({
    resolver: zodResolver(trainerSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobileNumber: "",
      businessName: "",
      agreeToTerms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof trainerSignupSchema>) {
    try {
      setIsLoading(true);

      // Remove confirmPassword before sending to backend
      const { confirmPassword, agreeToTerms, ...signupData } = values;

      // Send to backend
      const response = await axios.post("/api/auth/trainer/signup", signupData);

      if (response.status === 201) {
        toast.success("Account created successfully!");
        router.push("/trainer/login");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Signup Form */}
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
              Create your Account
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-sm mx-auto">
              Join ProTribe and start your fitness journey today
            </p>
          </div>

          {/* Signup Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          {...field}
                          className="h-11 sm:h-12 border-gray-300 focus:border-primary focus:ring-primary text-sm sm:text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Business Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter business name"
                          {...field}
                          className="h-11 sm:h-12 border-gray-300 focus:border-primary focus:ring-primary text-sm sm:text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Mobile Number
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <Input
                          placeholder="Enter mobile number"
                          {...field}
                          className="h-11 sm:h-12 pl-9 sm:pl-10 border-gray-300 focus:border-primary focus:ring-primary text-sm sm:text-base"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                            placeholder="Create password"
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            {...field}
                            className="h-11 sm:h-12 pl-9 sm:pl-10 pr-10 border-gray-300 focus:border-primary focus:ring-primary text-sm sm:text-base"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            {showConfirmPassword ? (
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
              </div>

              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs sm:text-sm text-gray-600">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-primary hover:text-primary/80 underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-primary hover:text-primary/80 underline"
                        >
                          Privacy Policy
                        </a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          {/* Sign In Link */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm sm:text-base text-gray-600">
              Already have an account?{" "}
              <a
                href="/trainer/login"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
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
              Connect with every client
            </h2>
            <p className="text-xl text-primary/90">
              Everything you need to manage your fitness business in one
              powerful dashboard.
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
