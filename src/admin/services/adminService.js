import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../lib/api'

const auth = { auth: true }

export function fetchDashboard() {
  return apiGet('/admin/dashboard', auth)
}

export function fetchVisitors(days = 7) {
  return apiGet(`/admin/visitors?days=${days}`, auth)
}

export function fetchAdminProducts() {
  return apiGet('/admin/products', auth)
}

export function fetchAdminProduct(id) {
  return apiGet(`/admin/products/${id}`, auth)
}

export function createProduct(body) {
  return apiPost('/admin/products', body, auth)
}

export function patchProduct(id, body) {
  return apiPatch(`/admin/products/${id}`, body, auth)
}

export function uploadProductImage(id, body) {
  return apiPost(`/admin/products/${id}/images`, body, auth)
}

export function deleteProductImage(id, sortOrder) {
  return apiDelete(`/admin/products/${id}/images/${sortOrder}`, auth)
}

export function setProductCoverImage(id, sortOrder) {
  return apiPatch(`/admin/products/${id}/images/cover`, { sortOrder }, auth)
}

export function addProductReview(productId, body) {
  return apiPost(`/admin/products/${productId}/reviews`, body, auth)
}

export function fetchOrders(status = 'all') {
  const q = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`
  return apiGet(`/admin/orders${q}`, auth)
}

export function patchOrderStatus(id, status) {
  return apiPatch(`/admin/orders/${id}/status`, { status }, auth)
}

export function fetchCoupons() {
  return apiGet('/admin/coupons', auth)
}

export function createCoupon(body) {
  return apiPost('/admin/coupons', body, auth)
}

export function updateCoupon(id, body) {
  return apiPatch(`/admin/coupons/${id}`, body, auth)
}

export function deleteCoupon(id) {
  return apiDelete(`/admin/coupons/${id}`, auth)
}

export function fetchReviews(status = 'pending') {
  return apiGet(`/admin/reviews?status=${encodeURIComponent(status)}`, auth)
}

export function patchReview(id, status) {
  return apiPatch(`/admin/reviews/${id}`, { status }, auth)
}

export function fetchTeam() {
  return apiGet('/admin/team', auth)
}

export function patchTeamMember(userId, body) {
  return apiPatch(`/admin/team/${userId}`, body, auth)
}

export function fetchSettings() {
  return apiGet('/admin/settings', auth)
}

export function saveSettings(body) {
  return apiPut('/admin/settings', body, auth)
}
