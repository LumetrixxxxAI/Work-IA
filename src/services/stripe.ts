import { apiClient } from './api'

export async function createCheckoutSession(plan: 'pro' | 'premium' = 'pro'): Promise<string> {
  const { data } = await apiClient.post<{ url: string }>('/api/stripe/checkout', {
    plan,
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/#/suscripcion`,
  })
  return data.url
}

export async function createPortalSession(): Promise<string> {
  const { data } = await apiClient.post<{ url: string }>('/api/stripe/portal', {
    returnUrl: `${window.location.origin}/ajustes`,
  })
  return data.url
}
