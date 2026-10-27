/**
 * Delhivery B2C API (server-side). Configure DELHIVERY_* in .env.
 * Delhivery state for an order is kept in orders.shipping_json.delhivery.
 * Docs: https://one.delhivery.com/developer-portal/documents/b2c/
 */

import { query } from '../config/db.js'

const BASE_URLS = {
  staging: 'https://staging-express.delhivery.com',
  production: 'https://track.delhivery.com',
}

function env(key, fallback = '') {
  return process.env[key]?.trim() || fallback
}

function num(key, fallback) {
  const n = Number(env(key))
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** DELHIVERY_ENV: staging | production | mock (mock fakes every call). */
export function delhiveryEnv() {
  const e = env('DELHIVERY_ENV', 'staging').toLowerCase()
  return ['staging', 'production', 'mock'].includes(e) ? e : 'staging'
}

export function isDelhiveryMock() {
  return delhiveryEnv() === 'mock'
}

export function isDelhiveryConfigured() {
  return isDelhiveryMock() || Boolean(env('DELHIVERY_API_TOKEN'))
}

function baseUrl() {
  return BASE_URLS[delhiveryEnv()] ?? BASE_URLS.staging
}

/** Public tracking page for customers. */
export function trackingUrl(awb) {
  return awb ? `https://www.delhivery.com/track-v2/package/${encodeURIComponent(awb)}` : null
}

function apiError(message, code = 'DELHIVERY_API_ERROR') {
  const err = new Error(message)
  err.code = code
  return err
}

function mockWaybill() {
  return `MOCK${Math.floor(1e11 + Math.random() * 9e11)}`
}

/** Fake Delhivery responses with the same shape as the real API. */
function mockResponse(method, path, body) {
  if (path.startsWith('/c/api/pin-codes/json/')) {
    const pin = Number(new URLSearchParams(path.split('?')[1]).get('filter_codes'))
    return {
      delivery_codes: [
        { postal_code: { pin, remarks: '', cod: 'Y', pre_paid: 'Y', pickup: 'Y', district: 'Mock District', state_code: 'MK' } },
      ],
    }
  }
  if (path === '/api/cmu/create.json') {
    return { success: true, packages: [{ waybill: mockWaybill(), status: 'Success', refnum: body?.shipments?.[0]?.order, remarks: [] }] }
  }
  if (path === '/fm/request/new/') {
    return { pickup_id: Math.floor(1e6 + Math.random() * 9e6), pickup_date: body.pickup_date, pickup_time: body.pickup_time }
  }
  if (path.startsWith('/api/p/packing_slip')) return { packages: [{ pdf_download_link: null }] }
  if (path.startsWith('/api/v1/packages/json/')) {
    const awb = new URLSearchParams(path.split('?')[1]).get('waybill')
    const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 19) // Delhivery sends IST
    return {
      ShipmentData: [
        {
          Shipment: {
            AWB: awb,
            Status: { Status: 'In Transit', StatusType: 'UD', StatusDateTime: now, StatusLocation: 'Mock hub' },
            Scans: [{ ScanDetail: { Scan: 'In Transit', ScanType: 'UD', ScanDateTime: now, ScannedLocation: 'Mock hub', Instructions: 'In transit (mock)' } }],
            ExpectedDeliveryDate: null,
          },
        },
      ],
    }
  }
  if (path === '/api/p/edit') return { status: true, remark: 'Shipment has been cancelled (mock)' }
  throw apiError(`Mock Delhivery has no response for ${method} ${path}`)
}

/** Pull a readable message out of Delhivery's various error shapes. */
function errorMessage(data, fallback) {
  if (!data) return fallback
  if (typeof data === 'string') return data.slice(0, 300) || fallback
  const remarks = data.packages?.[0]?.remarks
  if (Array.isArray(remarks) && remarks.length) return remarks.join(' ')
  if (typeof remarks === 'string' && remarks) return remarks
  for (const key of ['Error', 'error', 'rmk', 'message', 'remark', 'detail']) {
    const v = data[key]
    if (typeof v === 'string' && v) return v
    if (Array.isArray(v) && v.length) return v.join(' ')
  }
  return fallback
}

/**
 * Call the Delhivery API. `form` sends the body as format=json&data=<json>,
 * which is what the shipment creation endpoint expects.
 */
async function dl(method, path, { json, form } = {}) {
  if (isDelhiveryMock()) return mockResponse(method, path, json ?? form)
  if (!isDelhiveryConfigured()) throw apiError('Delhivery is not configured', 'DELHIVERY_NOT_CONFIGURED')
  const headers = { Accept: 'application/json', Authorization: `Token ${env('DELHIVERY_API_TOKEN')}` }
  let body
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    body = new URLSearchParams({ format: 'json', data: JSON.stringify(form) }).toString()
  } else if (json) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }
  const res = await fetch(`${baseUrl()}${path}`, { method, headers, body })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = text
  }
  if (res.status === 401 || res.status === 403) {
    throw apiError(`Delhivery rejected the API token (${delhiveryEnv()}): ${errorMessage(data, res.statusText)}`)
  }
  if (!res.ok) throw apiError(errorMessage(data, `Delhivery ${res.status}`))
  return data
}

/** Is this pincode serviceable? Empty list = not serviceable; remark "Embargo" = temporarily not. */
export async function checkServiceability(pincode) {
  const pin = String(pincode ?? '').replace(/\D/g, '')
  if (pin.length !== 6) throw apiError('Enter a 6-digit pincode', 'BAD_PINCODE')
  const data = await dl('GET', `/c/api/pin-codes/json/?filter_codes=${pin}`)
  const pc = data?.delivery_codes?.[0]?.postal_code
  if (!pc) return { pincode: pin, serviceable: false, cod: false, prepaid: false, embargo: false }
  const embargo = /embargo/i.test(pc.remarks ?? '')
  return {
    pincode: pin,
    serviceable: !embargo && (pc.pre_paid === 'Y' || pc.cod === 'Y'),
    cod: pc.cod === 'Y',
    prepaid: pc.pre_paid === 'Y',
    embargo,
    district: pc.district ?? '',
    state: pc.state_code ?? '',
  }
}

function parseJson(value, fallback) {
  if (value == null) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

async function loadOrder(orderId) {
  const [order] = await query('SELECT * FROM orders WHERE id = :id LIMIT 1', { id: orderId })
  if (!order) throw apiError('Order not found', 'ORDER_NOT_FOUND')
  const items = await query(
    'SELECT product_id, product_name, quantity, unit_price FROM order_items WHERE order_id = :id ORDER BY id',
    { id: orderId },
  )
  return { order, items, shipping: parseJson(order.shipping_json, {}) ?? {} }
}

async function saveDelhiveryState(orderId, patch) {
  const { shipping } = await loadOrder(orderId)
  const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined))
  const next = { ...shipping, delhivery: { ...(shipping.delhivery ?? {}), ...clean, updatedAt: new Date().toISOString() } }
  await query('UPDATE orders SET shipping_json = :json WHERE id = :id', { json: JSON.stringify(next), id: orderId })
  return next.delhivery
}

export async function getDelhiveryState(orderId) {
  const { shipping } = await loadOrder(orderId)
  return shipping.delhivery ?? null
}

/** Delhivery rejects & # % ; \ in text fields, even when encoded. */
function safeText(value, max = 200) {
  return String(value ?? '')
    .replace(/&/g, ' and ')
    .replace(/[#%;\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

/** Pickup date/time: today if there's still time before the pickup slot (IST), otherwise tomorrow. */
function nextPickupSlot() {
  const time = /^\d{2}:\d{2}:\d{2}$/.test(env('DELHIVERY_PICKUP_TIME')) ? env('DELHIVERY_PICKUP_TIME') : '14:00:00'
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000) // UTC fields now read as IST
  const [h, m] = time.split(':').map(Number)
  const minutesNow = ist.getUTCHours() * 60 + ist.getUTCMinutes()
  if (minutesNow > h * 60 + m - 60) ist.setUTCDate(ist.getUTCDate() + 1)
  if (ist.getUTCDay() === 0) ist.setUTCDate(ist.getUTCDate() + 1) // no Sunday pickups
  return { pickup_date: ist.toISOString().slice(0, 10), pickup_time: time }
}

/** Find an existing shipment for our order number (e.g. after a timeout or duplicate-order error). */
async function findWaybillByOrder(orderNumber) {
  try {
    const data = await dl('GET', `/api/v1/packages/json/?waybill=&ref_ids=${encodeURIComponent(orderNumber)}`)
    return data?.ShipmentData?.[0]?.Shipment?.AWB ?? null
  } catch {
    return null
  }
}

/**
 * Manifest the order with Delhivery (gets a waybill/AWB), then raise a pickup
 * request. Each step is saved so a failed step can be retried.
 */
export async function shipOrder(orderId) {
  const { order, items, shipping } = await loadOrder(orderId)
  if (order.status === 'cancelled') throw apiError('This order is cancelled', 'ORDER_CANCELLED')
  if (order.payment_method !== 'cod' && !order.razorpay_payment_id) {
    throw apiError('This order has not been paid yet', 'ORDER_UNPAID')
  }
  let state = shipping.delhivery ?? {}
  if (state.cancelled) throw apiError('This Delhivery shipment was cancelled', 'ORDER_CANCELLED')
  const pickupLocation = env('DELHIVERY_PICKUP_LOCATION')
  if (!pickupLocation) {
    throw apiError('Set DELHIVERY_PICKUP_LOCATION in .env to your registered Delhivery warehouse name', 'DELHIVERY_NOT_CONFIGURED')
  }

  if (!state.awb) {
    const service = await checkServiceability(shipping.pincode)
    const cod = order.payment_method === 'cod'
    if (!service.serviceable || (cod && !service.cod) || (!cod && !service.prepaid)) {
      const why = service.embargo ? 'is temporarily embargoed' : cod && service.prepaid ? 'is prepaid-only' : 'is not serviceable'
      throw apiError(`Delhivery: pincode ${service.pincode} ${why}`, 'NOT_SERVICEABLE')
    }

    const phone = String(order.customer_phone ?? '').replace(/\D/g, '').slice(-10)
    const quantity = items.reduce((s, i) => s + Number(i.quantity), 0)
    const shipment = {
      name: safeText(order.customer_name || 'Customer', 100),
      add: safeText([shipping.line1, shipping.line2].filter(Boolean).join(', '), 250),
      pin: String(shipping.pincode ?? ''),
      city: safeText(shipping.city, 60),
      state: safeText(shipping.state, 60),
      country: 'India',
      phone,
      order: String(order.order_number),
      payment_mode: cod ? 'COD' : 'Prepaid',
      cod_amount: cod ? String(order.total) : '0',
      total_amount: String(order.total),
      order_date: new Date(order.created_at).toISOString(),
      products_desc: safeText(items.map((i) => `${i.product_name} x${i.quantity}`).join(', '), 250),
      quantity: String(quantity || 1),
      weight: String(num('DELHIVERY_DEFAULT_WEIGHT_G', 500)),
      shipment_length: String(num('DELHIVERY_DEFAULT_LENGTH_CM', 20)),
      shipment_width: String(num('DELHIVERY_DEFAULT_BREADTH_CM', 15)),
      shipment_height: String(num('DELHIVERY_DEFAULT_HEIGHT_CM', 10)),
      shipping_mode: env('DELHIVERY_SHIPPING_MODE', 'Surface'),
      seller_name: safeText(env('DELHIVERY_SELLER_NAME'), 100),
      address_type: 'home',
    }
    const data = await dl('POST', '/api/cmu/create.json', {
      form: { shipments: [shipment], pickup_location: { name: pickupLocation } },
    })
    const pkg = data?.packages?.[0]
    let awb = pkg?.status === 'Success' ? pkg.waybill : null
    if (!awb && /duplicate/i.test(errorMessage(data, ''))) awb = await findWaybillByOrder(order.order_number)
    if (!awb) {
      const msg = errorMessage(data, 'unknown error')
      if (/clientwarehouse|warehouse|pickup location/i.test(msg)) {
        throw apiError(
          `Delhivery has no warehouse named "${pickupLocation}". Set DELHIVERY_PICKUP_LOCATION to the warehouse name exactly as shown in the Delhivery panel (Settings → Pickup locations). (${msg})`,
          'DELHIVERY_NOT_CONFIGURED',
        )
      }
      throw apiError(`Delhivery did not create the shipment: ${msg}`)
    }
    state = await saveDelhiveryState(orderId, {
      awb,
      env: delhiveryEnv(),
      status: 'Manifested',
      statusType: 'UD',
      paymentMode: shipment.payment_mode,
      pickupLocation,
    })
  }

  if (!state.pickupRequested) {
    const slot = nextPickupSlot()
    try {
      const data = await dl('POST', '/fm/request/new/', {
        json: { ...slot, pickup_location: state.pickupLocation || pickupLocation, expected_package_count: 1 },
      })
      if (data?.pr_exist) throw apiError('Pickup request already exists for today')
      if (!data?.pickup_id) throw apiError(errorMessage(data, 'Delhivery did not create the pickup request'))
      state = await saveDelhiveryState(orderId, {
        pickupRequested: true,
        pickupError: null,
        pickupId: data.pickup_id ?? null,
        pickupDate: `${data.pickup_date ?? slot.pickup_date} ${data.pickup_time ?? slot.pickup_time}`,
      })
    } catch (err) {
      // One pickup request per warehouse per day; an existing one also collects this parcel.
      if (/already|exist/i.test(err.message)) {
        state = await saveDelhiveryState(orderId, {
          pickupRequested: true,
          pickupError: null,
          pickupDate: `${slot.pickup_date} (joins today's pickup request)`,
        })
      } else {
        // The shipment exists; report the pickup failure so the admin can retry.
        await saveDelhiveryState(orderId, { pickupError: err.message })
        throw apiError(`Shipment created (AWB ${state.awb}) but pickup failed: ${err.message}`, 'PICKUP_FAILED')
      }
    }
  }

  if (['pending', 'completed', 'processing'].includes(order.status)) {
    await query(`UPDATE orders SET status = 'packed' WHERE id = :id`, { id: orderId })
  }
  return state
}

/** Fresh link to the shipping label PDF (the S3 links Delhivery returns expire). */
export async function getLabelUrl(orderId) {
  const state = await getDelhiveryState(orderId)
  if (!state?.awb) throw apiError('This order has not been shipped with Delhivery yet', 'NOT_SHIPPED')
  const size = env('DELHIVERY_LABEL_SIZE', '4R') === 'A4' ? 'A4' : '4R'
  const data = await dl('GET', `/api/p/packing_slip?wbns=${encodeURIComponent(state.awb)}&pdf=true&pdf_size=${size}`)
  const url = data?.packages?.[0]?.pdf_download_link
  if (!url && !isDelhiveryMock()) throw apiError(errorMessage(data, 'Delhivery did not return a label'))
  return url ?? null
}

/** Delhivery status + status type → our order status (null = no change). */
export function mapDelhiveryStatus(status, statusType) {
  const s = String(status ?? '').trim().toLowerCase()
  const t = String(statusType ?? '').trim().toUpperCase()
  if (!s) return null
  // Returns, RTO and cancellations are handled by the admin, not auto-applied.
  if (['RT', 'CN', 'PP', 'PU'].includes(t)) return null
  if (t === 'DL') return s === 'delivered' ? 'delivered' : null
  if (s === 'dispatched' || s.includes('out for delivery')) return 'out_for_delivery'
  if (s === 'in transit' || s === 'pending' || s.includes('picked up')) return 'shipped'
  return null
}

const STATUS_ORDER = ['pending', 'completed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered']

/** Move an order forward only (never backwards, never out of cancelled). */
async function advanceOrderStatus(orderId, next) {
  if (!next) return false
  const [row] = await query('SELECT status FROM orders WHERE id = :id LIMIT 1', { id: orderId })
  if (!row || row.status === 'cancelled') return false
  if (STATUS_ORDER.indexOf(next) <= STATUS_ORDER.indexOf(row.status)) return false
  await query('UPDATE orders SET status = :s WHERE id = :id', { s: next, id: orderId })
  return true
}

/** Fetch live tracking for an order and sync its status. */
export async function trackOrder(orderId) {
  const state = await getDelhiveryState(orderId)
  if (!state?.awb) throw apiError('This order has not been shipped with Delhivery yet', 'NOT_SHIPPED')
  const data = await dl('GET', `/api/v1/packages/json/?waybill=${encodeURIComponent(state.awb)}&ref_ids=`)
  const shipment = data?.ShipmentData?.[0]?.Shipment
  if (!shipment) throw apiError(errorMessage(data, 'Delhivery has no tracking for this waybill yet'))
  const st = shipment.Status ?? {}
  const activities = (shipment.Scans ?? [])
    .map((s) => s.ScanDetail ?? s)
    .map((s) => ({
      at: s.ScanDateTime ?? s.StatusDateTime ?? '',
      status: s.Instructions || s.Scan || '',
      location: s.ScannedLocation ?? '',
    }))
    .reverse() // newest first
  const etd = shipment.ExpectedDeliveryDate ?? shipment.PromisedDeliveryDate ?? null
  await saveDelhiveryState(orderId, { status: st.Status ?? state.status, statusType: st.StatusType ?? state.statusType, etd })
  const changed = await advanceOrderStatus(orderId, mapDelhiveryStatus(st.Status, st.StatusType))
  return {
    awb: state.awb,
    status: st.Status ?? '',
    statusType: st.StatusType ?? '',
    etd,
    trackUrl: trackingUrl(state.awb),
    activities,
    changed,
  }
}

/**
 * Handle a Delhivery scan-push webhook body:
 * { Shipment: { AWB, ReferenceNo, Status: { Status, StatusType, StatusDateTime, StatusLocation } } }
 */
export async function handleTrackingWebhook(body) {
  const shipment = body?.Shipment ?? body?.shipment ?? body ?? {}
  const st = shipment.Status ?? {}
  const awb = String(shipment.AWB ?? shipment.awb ?? '').trim()
  const orderNumber = String(shipment.ReferenceNo ?? shipment.reference_no ?? '').trim()
  let rows = []
  if (awb) {
    rows = await query(
      `SELECT id FROM orders WHERE JSON_UNQUOTE(JSON_EXTRACT(shipping_json, '$.delhivery.awb')) = :awb LIMIT 1`,
      { awb },
    )
  }
  if (!rows.length && orderNumber) {
    rows = await query('SELECT id FROM orders WHERE order_number = :n LIMIT 1', { n: orderNumber })
  }
  if (!rows.length) return { matched: false }
  const id = rows[0].id
  await saveDelhiveryState(id, { status: st.Status, statusType: st.StatusType })
  const changed = await advanceOrderStatus(id, mapDelhiveryStatus(st.Status, st.StatusType))
  return { matched: true, orderId: id, changed }
}

/** Cancel the Delhivery shipment (used when an order is cancelled here). */
export async function cancelDelhiveryShipment(orderId) {
  const state = await getDelhiveryState(orderId)
  if (!state?.awb || state.cancelled) return false
  const data = await dl('POST', '/api/p/edit', { json: { waybill: state.awb, cancellation: 'true' } })
  if (data?.status === false) throw apiError(errorMessage(data, 'Delhivery refused the cancellation'))
  await saveDelhiveryState(orderId, { cancelled: true, status: 'Cancelled' })
  return true
}
