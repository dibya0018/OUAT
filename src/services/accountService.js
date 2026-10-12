import { apiGet } from '../lib/api'

export function fetchMyOrders() {
  return apiGet('/account/orders', { auth: true })
}
