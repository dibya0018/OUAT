import { useEffect, useState } from 'react'

const ZONE = 'Asia/Kolkata'
const clock = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: ZONE })
const hour24 = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: ZONE })

function moment(hour) {
  if (hour >= 5 && hour < 11) return 'morning on the coast'
  if (hour >= 11 && hour < 17) return 'midday on the coast'
  if (hour >= 17 && hour < 19) return 'golden hour'
  if (hour >= 19 && hour < 23) return 'evening on the coast'
  return 'night on the coast'
}

/** The time in Goa right now, and what part of the day it is there. */
export function useGoaTime() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return { time: clock.format(now), moment: moment(Number(hour24.format(now)) % 24) }
}
