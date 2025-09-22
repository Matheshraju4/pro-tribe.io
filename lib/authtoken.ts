import * as jose from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const generateToken = async (data: any, Time: "7d" | "30d") => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new jose.SignJWT({ data })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Time)
    .sign(secret);

  return token;
};

export const verifyToken = async (
  token: string
): Promise<{ data: { role: string; email: string }; exp: number } | null> => {
  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return payload as { data: { role: string; email: string }; exp: number };
  } catch (error) {
    console.error("Token verification error", error);
    return null;
  }
};

export const getSession = async (
  req: NextRequest
): Promise<{
  data: { role: string; email: string; userId: string };
  exp: number;
} | null> => {
  const cookiesStore = await cookies();

  if (cookiesStore.get("proTribe-authToken")?.value) {
    const isVerified = await verifyToken(
      cookiesStore.get("proTribe-authToken")?.value as string
    );
    return isVerified as {
      data: { role: string; email: string; userId: string };
      exp: number;
    };
  } else {
    return null;
  }
};
