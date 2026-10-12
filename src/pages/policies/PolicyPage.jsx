import { NavLink, useParams } from 'react-router-dom'
import Seo from '../../components/Seo'
import Container from '../../components/ui/Container'
import NotFoundPage from '../NotFoundPage'
import { POLICIES } from './policyContent'
import { POLICY_LINKS } from '../../lib/site'
import EditorialTitle, { splitEditorialTitle } from '../../components/ui/EditorialTitle'
import { cx } from '../../lib/format'

/** Renders shipping / returns / privacy / terms from policyContent.js. */
export default function PolicyPage() {
  const { policySlug } = useParams()
  const policy = POLICIES[policySlug]
  if (!policy) return <NotFoundPage />

  const { accent, rest } = splitEditorialTitle(policy.title)

  return (
    <>
      <Seo title={policy.title} description={policy.description} path={`/policies/${policySlug}`} />

      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            {/* Side nav */}
            <nav aria-label="Policies" className="md:col-span-3">
              <p className="eyebrow">Policies</p>
              <ul className="mt-4 flex gap-6 overflow-x-auto whitespace-nowrap md:flex-col md:gap-3">
                {POLICY_LINKS.map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      className={({ isActive }) =>
                        cx('link-underline text-sm', isActive ? 'text-primary font-medium' : 'text-ink-soft')
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Body */}
            <article className="md:col-span-7 md:col-start-5">
              <EditorialTitle as="h1" size="lg" accent={accent} rest={rest} />
              <p className="mt-4 text-xs text-ink-soft">Last updated {policy.updated}</p>

              <div className="mt-12 flex flex-col gap-10">
                {policy.sections.map((s) => (
                  <section key={s.heading} className="border-t border-line pt-6">
                    <EditorialTitle as="h2" size="sm" {...splitEditorialTitle(s.heading)} />
                    <p className="mt-3 text-base text-ink-soft leading-relaxed">{s.body}</p>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </Container>
      </section>
    </>
  )
}
