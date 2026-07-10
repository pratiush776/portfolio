const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

// Web3Forms access keys are public by design (meant for in-browser forms), and
// their API sits behind Cloudflare bot protection that rejects server-side
// requests — so this must be called from the browser, never from an API route.
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
