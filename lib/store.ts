import { create } from "zustand"
import type { User } from "@/lib/types"

export interface Group {
  id: string
  displayName: string
  description?: string
  visibility?: string
}

export interface SharedMailbox {
  id: string
  displayName: string
  mail: string
  mailNickname: string
}

export interface DistributionList {
  id: string
  displayName: string
  mail: string
  mailNickname: string
  memberCount?: number
}

interface AppStore {
  users: User[]
  groups: Group[]
  mailboxes: SharedMailbox[]
  distLists: DistributionList[]
  loading: Record<string, boolean>
  setUsers: (users: User[]) => void
  setGroups: (groups: Group[]) => void
  setMailboxes: (mailboxes: SharedMailbox[]) => void
  setDistLists: (items: DistributionList[]) => void
  setLoading: (key: string, value: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  users: [],
  groups: [],
  mailboxes: [],
  distLists: [],
  loading: {},
  setUsers: (users) => set({ users }),
  setGroups: (groups) => set({ groups }),
  setMailboxes: (mailboxes) => set({ mailboxes }),
  setDistLists: (items) => set({ distLists: items }),
  setLoading: (key, value) =>
    set((s) => ({ loading: { ...s.loading, [key]: value } })),
}))
