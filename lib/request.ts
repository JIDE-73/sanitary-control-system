// const baseUrl = `${process.env.NEXT_PUBLIC_URL}:${process.env.NEXT_PUBLIC_PORT}`;
const baseUrl = `${process.env.NEXT_PUBLIC_URL}`;

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

  // Preserve HTTP status even if API payload includes its own `status` field
  return { status: response.status, ...(await response.json()) };
};

const request1 = async (url: string, method: string, body?: any) => {
  const hasJsonBody = body !== undefined && method !== "GET";

  const response = await fetch(`${baseUrl}${url}`, {
    method,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  // Preserve HTTP status even if API payload includes its own `status` field
  return { status: response.status, ...(await response.json()) };
};

const uploadRequest = async (url: string, formData: FormData, method: string = "POST") => {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    body: formData,
    credentials: "include",
  });

  const data = await response.json();
  return { ...data, status: response.status };
};

export { request, request1, uploadRequest };
