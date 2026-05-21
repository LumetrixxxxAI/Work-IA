import { apiClient } from './api'

export async function createCheckoutSession(): Promise<string> {
  const { data } = await apiClient.post<{ url: string }>('/api/stripe/checkout', {
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/paywall`,
  })
  return data.url
}

export async function createPortalSession(): Promise<string> {
  const { data } = await apiClient.post<{ url: string }>('/api/stripe/portal', {
    returnUrl: `${window.location.origin}/ajustes`,
  })
  return data.url
}
