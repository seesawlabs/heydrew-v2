import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("gdrive_state")?.value;

  if (!code || !state || state !== savedState) {
    return new NextResponse("Invalid or expired OAuth state", { status: 400 });
  }

  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse("Google Drive not configured", { status: 500 });
  }

  // Exchange authorization code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return new NextResponse("Failed to obtain access token", { status: 502 });
  }

  // Return HTML that notifies the opener window and closes the popup
  const origin = new URL(req.url).origin;
  const html = `<!DOCTYPE html>
<html><head><title>Connecting...</title></head>
<body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: "gdrive-auth-success" }, "${origin}");
  }
  window.close();
</script>
<p>You can close this window.</p>
</body></html>`;

  const response = new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
  response.cookies.set("gdrive_token", tokenData.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  response.cookies.delete("gdrive_state");
  return response;
}
