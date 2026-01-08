const baseUrl = process.env.NEXT_PUBLIC_URL;

const request = async (url: string, method: string, body?: any) => {
  const hasJsonBody = body !== undefined && method !== "GET";

  const response = await fetch(`${baseUrl}${url}`, {
    method,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
    headers: hasJsonBody
      ? {
          "Content-Type": "application/json",
        }
      : undefined,
    credentials: "include",
  });

  let parsed: any;
  try {
    parsed = await response.json();
  } catch {
    const text = await response.text();
    parsed = { message: text || "Respuesta no es JSON" };
  }

  // Preserve HTTP status even if API payload includes its own `status` field
  return { ...parsed, status: response.status };
};

const uploadRequest = async (url: string, formData: FormData) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await response.json();
  return { ...data, status: response.status };
};

export { request, uploadRequest };
