/** Shown on login/register when a guest arrives after paying — no order IDs in the UI. */
export default function PostCheckoutAuthNotice({ variant = 'register' }) {
  return (
    <p className="mt-6 rounded-xs border border-line bg-sand/40 px-4 py-3 text-sm text-ink-soft" role="status">
      {variant === 'register' ? (
        <>
          Your order is confirmed. <strong className="font-normal text-ink">Create an account</strong> with the same
          email you used at checkout to see status and tracking.
        </>
      ) : (
        <>
          Your order is confirmed. <strong className="font-normal text-ink">Sign in</strong> or create an account with
          the same email you used at checkout to see status and tracking.
        </>
      )}
    </p>
  )
}
