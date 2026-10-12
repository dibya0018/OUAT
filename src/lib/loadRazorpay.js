const SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

let loading = null

export function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay))
      existing.addEventListener('error', reject)
      return
    }
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.onload = () => resolve(window.Razorpay)
    s.onerror = reject
    document.body.appendChild(s)
  })
  return loading
}
