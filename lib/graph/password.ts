import { getGraphClient } from "./client"

export async function resetPassword(userId: string) {
  const client = await getGraphClient()

  const password = generatePassword()

  await client.api(`/users/${userId}`).patch({
    passwordProfile: {
      forceChangePasswordNextSignIn: true,
      password,
    },
  })

  return { temporaryPassword: password }
}

export async function revokeMfaSessions(userId: string) {
  const client = await getGraphClient()

  await client.api(`/users/${userId}/revokeSignInSessions`).post({})

  return { success: true }
}

function generatePassword(): string {
  const length = 16
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}
