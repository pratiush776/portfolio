export async function POST(request: Request) {
  try {
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      return Response.json(
        { error: "Access key not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        ...body,
        access_key: accessKey,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Web3Forms error response:", text);
      return Response.json(
        { success: false, error: "Failed to send via web3forms" },
        { status: 400 },
      );
    }

    const result = await response.json();

    if (result.success) {
      return Response.json({ success: true });
    } else {
      return Response.json(
        { success: false, error: result.message },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Failed to send contact form:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
