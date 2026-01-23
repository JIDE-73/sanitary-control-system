const baseUrl = `${process.env.NEXT_PUBLIC_URL}`;

// Función helper para obtener el token
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("sics-auth-token");
  } catch (error) {
    return null;
  }
};

const request = async (url: string, method: string, body?: any) => {
  const hasJsonBody = body !== undefined && method !== "GET";
  const token = getToken();

  const headers: HeadersInit = {};
  
  if (hasJsonBody) {
    headers["Content-Type"] = "application/json";
  }
  
  // Agregar el token si está disponible (excepto para el login)
  if (token && !url.includes("/admin/users/login")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${url}`, {
    method,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    credentials: "include",
  });

  const data = await response.json();
  console.log(data);

  // Preserve HTTP status even if API payload includes its own `status` field
  return { status: response.status, ...data };
};

const uploadRequest = async (url: string, formData: FormData, method: string = "POST") => {
  const token = getToken();
  
  const headers: HeadersInit = {};
  
  // Agregar el token si está disponible
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${url}`, {
    method,
    body: formData,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    credentials: "include",
  });

  const data = await response.json();
  return { ...data, status: response.status };
};

export { request, uploadRequest };
