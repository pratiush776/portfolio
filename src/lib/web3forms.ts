const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

/**
 * Web3Forms access keys are public by design (they are meant for in-browser forms), and the API
 * sits behind Cloudflare bot protection that serves a JavaScript challenge to server-side
 * requests — every submission from an API route came back 403 and failed silently. So this must be
 * called from the browser, where a real visitor's browser passes the bot check, and never from a
 * route handler or a Server Component.
 *
 * Carried over from v4 unchanged: this is the version that actually works, and the reasoning above
 * is exactly why it looks the way it does.
 */
export async function submitToWeb3Forms(
  payload: Record<string, unknown>,
): Promise<boolean> {
  if (!ACCESS_KEY) {
    console.error("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY is not configured");
    return false;
  }

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ...payload, access_key: ACCESS_KEY }),
      // The view notification is sent as the page is going away, and an ordinary fetch is
      // cancelled the instant the document does. `keepalive` hands the request to the browser to
      // finish on its own. Its 64KB ceiling is no constraint on a few lines of text, and it costs
      // nothing on the calls that are not made at unload.
      keepalive: true,
    });

    if (!response.ok) {
      console.error("Web3Forms error response:", await response.text());
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("Failed to submit to Web3Forms:", error);
    return false;
  }
}
