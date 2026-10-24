export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
export class NetworkError extends Error {}
let csrf = ''
export function setCsrf(value: string) {
  csrf = value
}

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof DOMException && error.name === 'TimeoutError')
    ) {
      throw new NetworkError('Δεν είναι διαθέσιμη η σύνδεση με τον server.')
    }
    throw error
  }
  if (!response.ok) {
    if (response.status >= 500) throw new NetworkError('Ο server δεν είναι διαθέσιμος.')
    const data = await response.json()
    throw new ApiError(response.status, data.detail)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}
