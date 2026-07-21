"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseMutationResult<T> {
  mutate: (method: string, body?: unknown) => Promise<T | null>
  loading: boolean
  error: string | null
}

export function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  useEffect(() => {
    const id = ++fetchId.current
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch(url, { signal: controller.signal })
        const json: ApiResponse<T> = await res.json()
        if (id !== fetchId.current) return
        if (!res.ok) {
          setError(json.error ?? "An error occurred")
          setData(null)
        } else {
          setData(json.data ?? null)
          setError(null)
        }
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return
        if (id !== fetchId.current) return
        setError("Network error")
        setData(null)
      } finally {
        if (id === fetchId.current) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [url])

  const refetch = useCallback(async () => {
    fetchId.current++
    setLoading(true)
    setError(null)
    setData(null)
    const id = fetchId.current
    try {
      const res = await fetch(url)
      const json: ApiResponse<T> = await res.json()
      if (id !== fetchId.current) return
      if (!res.ok) {
        setError(json.error ?? "An error occurred")
        setData(null)
      } else {
        setData(json.data ?? null)
        setError(null)
      }
    } catch {
      if (id === fetchId.current) setError("Network error")
    } finally {
      if (id === fetchId.current) setLoading(false)
    }
  }, [url])

  return { data, loading, error, refetch }
}

export function useMutation<T>(url: string): UseMutationResult<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  const mutate = useCallback(async (method: string, body?: unknown): Promise<T | null> => {
    cancelled.current = false
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })
      const json: ApiResponse<T> = await res.json()
      if (cancelled.current) return null
      if (!res.ok) {
        setError(json.error ?? "An error occurred")
        return null
      }
      return json.data ?? null
    } catch {
      if (!cancelled.current) setError("Network error")
      return null
    } finally {
      if (!cancelled.current) setLoading(false)
    }
  }, [url])

  return { mutate, loading, error }
}
