"use client"

import Loader, { NormalLoader } from "@/components/modules/general/loader"
import LoginForm from "@/components/modules/pages/trainer/auth/login-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"


const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    rememberMe: z.boolean(),
})

const LoginFormContent = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()


    const searchParams = useSearchParams()
    const url = searchParams.get("url")

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
        mode: "onChange",
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {

        setIsLoading(true)

        const body = {
            email: values.email,
            password: values.password,
            rememberMe: values.rememberMe,
            url: url,
        }
        try {

            const response = await axios.post("/api/clients/auth/login", body)
            if (response.status === 200) {
                toast.success("Login successful!")
                router.push("/dashboard")
            } else {
                toast.error("Login failed!")
            }
        } catch (error) {
            console.error("Login error", error)
            toast.error("Login failed!")
        } finally {
            setIsLoading(false)
        }

    }




    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    Welcome Back to ProTribe
                </CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to login
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            placeholder="Enter your email address"
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
                                            placeholder="Enter your password"
                                            className="h-11 border-gray-300 focus:border-primary focus:ring-[0.5px] focus:ring-primary"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between">
                            <FormField control={form.control} name="rememberMe" render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                        Remember me
                                    </FormLabel>
                                </FormItem>
                            )} />
                            <a href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium">
                                Forgot password?
                            </a>
                        </div>


                        <Button
                            type="submit"
                            className="w-full bg-primary text-white hover:bg-primary/90 h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? <NormalLoader text="Logging in..." type="icon" /> : "Login"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link
                                href={`/signup${url ? `?url=${url}` : ""}`}
                                className="text-primary hover:underline font-medium"
                            >
                                Sign up here
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

const LoginPage = () => {
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

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <Suspense fallback={
                    <Card className="w-full shadow-lg">
                        <CardContent className="flex items-center justify-center py-12">
                            <NormalLoader text="Loading..." type="icon" />
                        </CardContent>
                    </Card>
                }>
                    <LoginFormContent />
                </Suspense>
            </div>
        </div>
    )
}

export default LoginPage