import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSession, saveSession } from '../lib/session'
import { buildSession, jsonResponse } from '../test/factories'
import { ApiError, request, setUnauthorizedHandler } from './http'

const fetchMock = vi.fn<typeof fetch>()

const rejection = (promise: Promise<unknown>): Promise<ApiError> =>
  promise.then(
    () => {
      throw new Error('Expected the request to fail')
    },
    (error: unknown) => error as ApiError,
  )

const callAt = (index: number) => {
  const [url, init] = fetchMock.mock.calls[index]
  return {
    url: String(url),
    method: init?.method,
    headers: init?.headers as Record<string, string>,
    body: init?.body,
  }
}

describe('http client', () => {
  const unauthorized = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    unauthorized.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    setUnauthorizedHandler(unauthorized)
    saveSession(buildSession())
  })

  it('sends the bearer token and a JSON body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }))

    const result = await request<{ ok: boolean }>('/alerts', { method: 'POST', body: { a: 1 } })

    expect(result).toEqual({ ok: true })
    const call = callAt(0)
    expect(call.url).toMatch(/\/api\/alerts$/)
    expect(call.method).toBe('POST')
    expect(call.headers.Authorization).toBe('Bearer access-1')
    expect(call.headers['Content-Type']).toBe('application/json')
    expect(call.body).toBe('{"a":1}')
  })

  it('omits the token for unauthenticated requests', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    await request('/auth/login', { method: 'POST', body: {}, auth: false })
    expect(callAt(0).headers.Authorization).toBeUndefined()
  })

  it('returns undefined for 204 responses', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204))
    await expect(request('/alerts/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('throws an ApiError carrying the status and field errors', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: 'Validation failed', errors: [{ path: 'threshold', message: 'Too small' }] },
        400,
      ),
    )

    const error = await rejection(request('/alerts', { method: 'POST', body: {} }))

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.message).toBe('Validation failed')
    expect(error.errors).toEqual([{ path: 'threshold', message: 'Too small' }])
  })

  it('refreshes the session once on 401 and retries with the new token', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, 401))
      .mockResolvedValueOnce(
        jsonResponse(buildSession({ accessToken: 'access-2', refreshToken: 'refresh-2' })),
      )
      .mockResolvedValueOnce(jsonResponse([{ id: 'x' }]))

    const result = await request('/symbols')

    expect(result).toEqual([{ id: 'x' }])
    expect(callAt(1).url).toMatch(/\/auth\/refresh$/)
    expect(callAt(1).body).toBe('{"refreshToken":"refresh-1"}')
    expect(callAt(2).headers.Authorization).toBe('Bearer access-2')
    expect(loadSession()?.refreshToken).toBe('refresh-2')
    expect(unauthorized).not.toHaveBeenCalled()
  })

  it('shares a single refresh between concurrent 401s', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input)
      if (url.endsWith('/auth/refresh')) {
        return jsonResponse(buildSession({ accessToken: 'access-2', refreshToken: 'refresh-2' }))
      }
      const { Authorization: token } = (init?.headers ?? {}) as Record<string, string>
      return token === 'Bearer access-2' ? jsonResponse({ ok: true }) : jsonResponse({}, 401)
    })

    await Promise.all([request('/symbols'), request('/alerts')])

    const refreshCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/auth/refresh'))
    expect(refreshCalls).toHaveLength(1)
  })

  it('clears the session and notifies when the refresh fails', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'Invalid refresh token' }, 401))

    const error = await rejection(request('/symbols'))

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(401)
    expect(loadSession()).toBeNull()
    expect(unauthorized).toHaveBeenCalledTimes(1)
  })

  it('does not attempt a refresh for unauthenticated requests', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Invalid credentials' }, 401))

    const error = await rejection(
      request('/auth/login', { method: 'POST', body: {}, auth: false }),
    )

    expect(error.message).toBe('Invalid credentials')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
