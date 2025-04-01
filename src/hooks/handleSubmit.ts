"use server";
export async function handleSubmit(formData: FormData) {
  formData.append("access_key", "03c13abd-95f8-4f30-ba8d-db8e8c0cb6e4");

  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: json,
  });
}
