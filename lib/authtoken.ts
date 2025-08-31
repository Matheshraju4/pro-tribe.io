import * as jose from "jose";

export const generateToken = async (data: any, Time: "7d" | "30d") => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new jose.SignJWT({ data })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Time)
    .sign(secret);

  return token;
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return payload;
  } catch (error) {
    console.error("Token verification error", error);
    return null;
  }
};
