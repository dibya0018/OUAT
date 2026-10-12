import { useCallback, useEffect, useState } from 'react'
import { fetchMyOrders } from '../services/accountService'
import { useAuth } from './useAuth'

export function useCustomerOrders() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([])
      setActiveCount(0)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetchMyOrders()
      setOrders(res.orders ?? [])
      setActiveCount(res.activeCount ?? 0)
    } catch (e) {
      setError(e.message || 'Could not load orders')
      setOrders([])
      setActiveCount(0)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const onChange = () => reload()
    window.addEventListener('ouat:orders-changed', onChange)
    return () => window.removeEventListener('ouat:orders-changed', onChange)
  }, [reload])

  return { orders, activeCount, loading, error, reload }
}
