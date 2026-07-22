"use client"

import useSWR from "swr"
import { useEffect } from "react"
import { useAppStore, type Group, type SharedMailbox, type DistributionList, type LicenseInfo } from "@/lib/store"
import type { User } from "@/lib/types"

const fetcher = <T>(url: string): Promise<T> =>
  fetch(url).then((r) => r.json()).then((d) => d.data as T)

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR("/api/users", fetcher<User[]>)
  const setUsers = useAppStore((s) => s.setUsers)
  const setLoading = useAppStore((s) => s.setLoading)

  useEffect(() => {
    setLoading("users", isLoading)
    if (data) setUsers(data)
  }, [data, isLoading, setUsers, setLoading])

  return { data: data ?? [], error, isLoading, mutate }
}

export function useGroups() {
  const { data, error, isLoading, mutate } = useSWR("/api/groups?search=GGA-", fetcher<Group[]>)
  const setGroups = useAppStore((s) => s.setGroups)
  const setLoading = useAppStore((s) => s.setLoading)

  useEffect(() => {
    setLoading("groups", isLoading)
    if (data) setGroups(data)
  }, [data, isLoading, setGroups, setLoading])

  return { data: data ?? [], error, isLoading, mutate }
}

export function useMailboxes() {
  const { data, error, isLoading, mutate } = useSWR("/api/exchange/mailboxes", fetcher<SharedMailbox[]>)
  const setMailboxes = useAppStore((s) => s.setMailboxes)
  const setLoading = useAppStore((s) => s.setLoading)

  useEffect(() => {
    setLoading("mailboxes", isLoading)
    if (data) setMailboxes(data)
  }, [data, isLoading, setMailboxes, setLoading])

  return { data: data ?? [], error, isLoading, mutate }
}

export function useDistLists() {
  const { data, error, isLoading, mutate } = useSWR("/api/exchange/distribution-lists", fetcher<DistributionList[]>)
  const setDistLists = useAppStore((s) => s.setDistLists)
  const setLoading = useAppStore((s) => s.setLoading)

  useEffect(() => {
    setLoading("distLists", isLoading)
    if (data) setDistLists(data)
  }, [data, isLoading, setDistLists, setLoading])

  return { data: data ?? [], error, isLoading, mutate }
}

export function useLicenses() {
  const { data, error, isLoading, mutate } = useSWR("/api/licenses", fetcher<LicenseInfo[]>)
  const setLicenses = useAppStore((s) => s.setLicenses)
  const setLoading = useAppStore((s) => s.setLoading)

  useEffect(() => {
    setLoading("licenses", isLoading)
    if (data) setLicenses(data)
  }, [data, isLoading, setLicenses, setLoading])

  return { data: data ?? [], error, isLoading, mutate }
}

export function useAllDashboardData() {
  const users = useUsers()
  const groups = useGroups()
  const mailboxes = useMailboxes()
  const distLists = useDistLists()
  const licenses = useLicenses()

  const loading =
    users.isLoading ||
    groups.isLoading ||
    mailboxes.isLoading ||
    distLists.isLoading ||
    licenses.isLoading

  return { users, groups, mailboxes, distLists, licenses, loading }
}
