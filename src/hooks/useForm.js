import { useCallback, useState } from 'react'

/**
 * Minimal form state for the formService handlers.
 *
 * @param {object} initialValues
 * @param {(values: object) => Promise<{ ok: boolean, errors?: object }>} submitFn
 * @param {(values: object) => void} [onSuccess]
 */
export function useForm(initialValues, submitFn, onSuccess) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }))
    // Editing a field clears its own error and any form-level error.
    setErrors((err) =>
      err[name] || err.form ? { ...err, [name]: undefined, form: undefined } : err,
    )
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.()
      setErrors({})
      setStatus('submitting')
      try {
        const result = await submitFn(values)
        if (result.ok) {
          setStatus('success')
          setErrors({})
          onSuccess?.(values)
        } else {
          setStatus('idle')
          setErrors(result.errors ?? {})
        }
      } catch {
        setStatus('error')
      }
    },
    [values, submitFn, onSuccess],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setStatus('idle')
  }, [initialValues])

  return { values, errors, status, handleChange, handleSubmit, reset }
}
