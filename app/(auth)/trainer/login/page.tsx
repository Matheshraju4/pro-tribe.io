import LoginForm from "@/components/modules/pages/trainer/auth/login-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const LoginPage = async () => {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("proTribe-authToken");
  if (authToken) {
    redirect("/trainer");
  }
  return <LoginForm />;
};

export default LoginPage;
