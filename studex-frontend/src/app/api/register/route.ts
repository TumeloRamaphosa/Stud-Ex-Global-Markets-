const N8N_RUNNER_URL =
  process.env.N8N_RUNNER_URL || "http://localhost:3003";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, business } = body;

  if (!name || !email || !phone) {
    return Response.json(
      { error: "Name, email and phone are required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${N8N_RUNNER_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        business: business || "",
        registeredAt: new Date().toISOString(),
        event: "Global Markets Launch - July 8-9",
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        (errData as Record<string, string>).error || "n8n-runner registration failed"
      );
    }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return Response.json(
      {
        error: "Registration failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
