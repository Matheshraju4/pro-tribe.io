"use client"

import { NormalLoader } from "@/components/modules/general/loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const SignupFormContent = () => {
    const searchParams = useSearchParams()
    const url = searchParams.get("url")
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange",
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!url) {
            toast.error("Invalid signup link. Please use the link provided by your trainer.")
            return
        }

        setIsLoading(true)
        try {
            const body = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phone: values.phone || undefined,
                password: values.password,
                trainerUrl: url,
            }

            const response = await axios.post("/api/clients/auth/signup", body)

            if (response.status === 201) {
                toast.success("Account created successfully! Redirecting...")
                setTimeout(() => {
                    router.push("/login")
                }, 1500)
            }
        } catch (error: any) {
            console.error("Signup error:", error)
            const errorMessage = error.response?.data?.error || "Failed to create account"
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    Create Your Account
                </CardTitle>
                <CardDescription className="text-center">
                    Join your trainer on ProTribe
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="John"
                                                className="h-11 border-gray-300 focus:border-primary focus:ring-[0.5px] focus:ring-primary"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Doe"
                                                className="h-11 border-gray-300 focus:border-primary focus:ring-[0.5px] focus:ring-primary"
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
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            {...field}
                                            placeholder="john.doe@example.com"
                                            className="h-11 border-gray-300 focus:border-primary focus:ring-[0.5px] focus:ring-primary"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            {...field}
                                            placeholder="+1 234 567 8900"
                                            className="h-11 border-gray-300 focus:border-primary focus:ring-[0.5px] focus:ring-primary"
                                        />
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
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            {...field}
                                            placeholder="Create a strong password"
                                            className="h-11 border-gray-300 focus:border-primary focus:ring-[0.5px] focus:ring-primary"
                                        />
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
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            {...field}
                                            placeholder="Re-enter your password"
                                            className="h-11 border-gray-300 focus:border-primary focus:ring-[0.5px] focus:ring-primary"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-primary text-white hover:bg-primary/90 h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? <NormalLoader text="Creating Account..." type="icon" /> : "Sign Up"}
                        </Button>
                    </form>
                </Form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link
                        href={`/login${url ? `?url=${url}` : ""}`}
                        className="text-primary hover:underline font-medium"
                    >
                        Login here
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

const SignupPage = () => {
    return (
        <div className="min-h-screen w-full bg-white relative flex items-center justify-center p-4">
            {/* Diagonal Cross Center Fade Grid Background */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
                        linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
                    `,
                    backgroundSize: "40px 40px",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
                    maskImage:
                        "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
                }}
            />

            {/* Signup Card */}
            <div className="relative z-10 w-full max-w-lg">
                <Suspense fallback={
                    <Card className="w-full shadow-lg">
                        <CardContent className="flex items-center justify-center py-12">
                            <NormalLoader text="Loading..." type="icon" />
                        </CardContent>
                    </Card>
                }>
                    <SignupFormContent />
                </Suspense>
            </div>
        </div>
    )
}

export default SignupPage

