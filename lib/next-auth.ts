const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_REDIRECT_URI = "http://localhost:3000/api/auth/callback/google";

export async function getGoogleOAuthUrl() {
  const url = new URL(GOOGLE_OAUTH_URL);
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "email profile");

  return url.toString();
}

export async function fetchUserInfo(code: string) {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
      }),
    });

    const data = await response.json();

    console.log("Received Response", data);

    if (!response.ok) {
      throw new Error(data.error_description || "Failed to fetch access token");
    }

    return {
      access_token: data.access_token,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}
