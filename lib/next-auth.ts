import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  cookies: {
    sessionToken: {
      name: "proTribe-authToken",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("jwt", token, account, profile);
      if (account) token.provider = account.provider;
      if (profile && "email" in profile) token.email = profile.email as string;
      return token;
    },
    async session({ session, token }) {
      console.log("session", session, token);
      if (token.email) {
        session.user = {
          ...session.user,
          email: token.email,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If NextAuth asks to go to baseUrl again, send them to a stable page
      if (url === baseUrl) return `${baseUrl}/trainer/dashboard`;

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch {}
      return `${baseUrl}/trainer/dashboard`;
    },
  },
});
