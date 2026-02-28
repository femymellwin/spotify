import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Set DASHBOARD_PASSWORD in your Vercel environment variables.
// Leave unset (or empty) to disable password protection.
const PASSWORD = process.env.DASHBOARD_PASSWORD;

export function middleware(request: NextRequest) {
  // Skip if no password is configured
  if (!PASSWORD) return NextResponse.next();

  // Allow API routes through (they're server-side only)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("dashboard-auth");
  if (cookie?.value === PASSWORD) return NextResponse.next();

  // If submitting the login form
  if (request.method === "POST") {
    const url = request.nextUrl.clone();
    url.pathname = "/_auth";
    return NextResponse.rewrite(url);
  }

  // Show login page
  const entered = request.headers.get("x-dashboard-password");
  if (entered === PASSWORD) {
    const response = NextResponse.next();
    response.cookies.set("dashboard-auth", PASSWORD, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  // Return basic auth challenge
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <title>Mission Control — Access</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0a; color: #c8c8c8; font-family: 'JetBrains Mono', monospace;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { border: 1px solid #1e1e1e; padding: 2rem; width: 320px; }
    h1 { color: #ff6600; font-size: 0.75rem; letter-spacing: 0.2em; margin-bottom: 1.5rem; }
    input { width: 100%; background: #111; border: 1px solid #1e1e1e; color: #c8c8c8;
            padding: 0.5rem 0.75rem; font-family: inherit; font-size: 0.75rem;
            margin-bottom: 1rem; outline: none; }
    input:focus { border-color: #ff6600; }
    button { width: 100%; background: #ff6600; color: #0a0a0a; border: none;
             padding: 0.5rem; font-family: inherit; font-size: 0.75rem;
             font-weight: 700; letter-spacing: 0.1em; cursor: pointer; }
    button:hover { background: #ff8533; }
    .err { color: #ff3333; font-size: 0.65rem; letter-spacing: 0.1em; margin-bottom: 0.75rem; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>● INCEPTION MISSION CONTROL</h1>
    <p class="err" id="err">INVALID PASSWORD</p>
    <input type="password" id="pw" placeholder="Enter password" autofocus />
    <button onclick="auth()">ACCESS</button>
  </div>
  <script>
    function auth() {
      const pw = document.getElementById('pw').value;
      fetch(location.href, { headers: { 'x-dashboard-password': pw } })
        .then(r => { if (r.ok && r.redirected === false && r.status < 400) { location.reload(); }
                     else { document.getElementById('err').style.display = 'block'; } })
        .catch(() => { document.getElementById('err').style.display = 'block'; });
    }
    document.getElementById('pw').addEventListener('keydown', e => { if (e.key === 'Enter') auth(); });
  </script>
</body>
</html>`,
    {
      status: 401,
      headers: { "Content-Type": "text/html" },
    }
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
