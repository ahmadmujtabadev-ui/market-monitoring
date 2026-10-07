import { create } from 'zustand'
import { usersApi } from '../api/endpoints'
import { toFailure } from '../lib/errors'
import { clearSession, saveSession } from '../lib/session'
import type { ActionResult, ChangePasswordInput } from '../types'
import { useAuthStore } from './authStore'

interface ProfileState {
  updateProfile: (name: string) => Promise<ActionResult>
  changePassword: (input: ChangePasswordInput) => Promise<ActionResult>
  deleteAccount: (password: string) => Promise<ActionResult>
}

export const useProfileStore = create<ProfileState>(() => ({
  updateProfile: async (name) => {
    try {
      useAuthStore.getState().setUser(await usersApi.updateProfile(name))
      return { ok: true }
    } catch (error) {
      return toFailure(error)
    }
  },
  changePassword: async (input) => {
    try {
      const session = await usersApi.changePassword(input)
      saveSession(session)
      useAuthStore.setState({ user: session.user })
      return { ok: true }
    } catch (error) {
      return toFailure(error)
    }
  },
  deleteAccount: async (password) => {
    try {
      await usersApi.deleteAccount(password)
      clearSession()
      useAuthStore.setState({ user: null })
      return { ok: true }
    } catch (error) {
      return toFailure(error)
    }
  },
}))
