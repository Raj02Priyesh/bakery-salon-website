import { useId, useState, type ReactNode } from 'react'
import type { Brand } from '../brands/types'
import {
  bookingMessage,
  emptyRequest,
  estimate,
  nowInZone,
  validateBooking,
  whatsappUrl,
  type BookingErrors,
  type BookingRequest,
} from '../lib/booking'
import { buttonPrimary, formatPrice } from '../lib/format'
import { DAY_NAMES, formatTime } from '../lib/hours'
import { useNow } from '../lib/useNow'
import { Reveal, SectionHeading } from './ui'

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/70 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500'

function Field({ label, error, children, id, hint }: { label: string; error?: string; children: ReactNode; id: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}

export function Booking({ brand, preselected }: { brand: Brand; preselected: { id: string; nonce: number } | null }) {
  const uid = useId()
  const [req, setReq] = useState<BookingRequest>(() => emptyRequest(brand.offerings.items[0].id))
  const [errors, setErrors] = useState<BookingErrors>({})
  const [submitted, setSubmitted] = useState<BookingRequest | null>(null)
  const [appliedSelection, setAppliedSelection] = useState(preselected)
  const now = useNow()
  const { booking, contact } = brand

  // A "Book/Order" click in the menu pre-selects that item. (Switching brand remounts this
  // component, which resets the form.) Adjusting state during render is React's recommended
  // pattern for responding to a prop change.
  if (preselected !== appliedSelection) {
    setAppliedSelection(preselected)
    if (preselected) {
      setReq((r) => ({ ...r, offeringId: preselected.id }))
      setSubmitted(null)
    }
  }

  const set = <K extends keyof BookingRequest>(key: K, value: BookingRequest[K]) => {
    setReq((r) => ({ ...r, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateBooking(req, brand, nowInZone(contact.timezone, new Date()))
    setErrors(found)
    if (Object.keys(found).length === 0) {
      setSubmitted(req)
      // The summary is shorter than the form; bring its top into view.
      requestAnimationFrame(() => document.getElementById(`${uid}-card`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    } else {
      document.getElementById(`${uid}-${Object.keys(found)[0]}`)?.focus()
    }
  }

  const today = nowInZone(contact.timezone, now)
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const fieldProps = (key: keyof BookingRequest) => ({
    id: `${uid}-${key}`,
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `${uid}-${key}-error` : undefined,
    className: inputClass,
  })
  const groups = brand.offerings.categories

  return (
    <section id="book" className="bg-surface-alt py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <SectionHeading eyebrow={booking.kind === 'order' ? 'Pre-order' : 'Appointments'} title={booking.title} subtitle={booking.subtitle} />
          <ul className="space-y-3 text-muted">
            <li>✓ No payment online - pay {booking.kind === 'order' ? 'at pickup' : 'after your visit'}</li>
            <li>✓ At least {booking.minNoticeHours} hours’ notice, please</li>
            <li>✓ Prefer to call? {contact.phoneDisplay}</li>
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div id={`${uid}-card`} className="rounded-brand border border-line bg-surface p-6 shadow-xl shadow-black/5 sm:p-8">
            {submitted ? (
              <Summary brand={brand} req={submitted} onEdit={() => setSubmitted(null)} />
            ) : (
              <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label={booking.offeringLabel} id={`${uid}-offeringId`} error={errors.offeringId}>
                    <select {...fieldProps('offeringId')} value={req.offeringId} onChange={(e) => set('offeringId', e.target.value)}>
                      {groups.map((g) => (
                        <optgroup key={g} label={g}>
                          {brand.offerings.items
                            .filter((o) => o.category === g)
                            .map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name} - {o.duration ? 'from ' : ''}
                                {formatPrice(o.price)}
                                {o.priceNote ? ` (${o.priceNote})` : ''}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </Field>
                </div>

                {booking.askQuantity && (
                  <Field label="Quantity" id={`${uid}-quantity`} error={errors.quantity}>
                    <input
                      {...fieldProps('quantity')}
                      type="number"
                      min={1}
                      max={50}
                      inputMode="numeric"
                      value={req.quantity}
                      onChange={(e) => set('quantity', Number(e.target.value))}
                    />
                  </Field>
                )}
                {booking.askStaff && (
                  <Field label="Preferred stylist" id={`${uid}-staff`}>
                    <select {...fieldProps('staff')} value={req.staff} onChange={(e) => set('staff', e.target.value)}>
                      <option>Any stylist</option>
                      {brand.team.members.map((m) => (
                        <option key={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label="Your name" id={`${uid}-name`} error={errors.name}>
                  <input {...fieldProps('name')} autoComplete="name" value={req.name} onChange={(e) => set('name', e.target.value)} />
                </Field>
                <Field label="Mobile number" id={`${uid}-phone`} error={errors.phone}>
                  <input
                    {...fieldProps('phone')}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="98765 43210"
                    value={req.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </Field>
                <Field label={booking.kind === 'order' ? 'Pickup date' : 'Date'} id={`${uid}-date`} error={errors.date} hint={closedDaysHint(brand)}>
                  <input {...fieldProps('date')} type="date" min={minDate} value={req.date} onChange={(e) => set('date', e.target.value)} />
                </Field>
                <Field label={booking.kind === 'order' ? 'Pickup time' : 'Time'} id={`${uid}-time`} error={errors.time}>
                  <input {...fieldProps('time')} type="time" step={900} value={req.time} onChange={(e) => set('time', e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={booking.kind === 'order' ? 'Notes (message on cake, eggless, etc.)' : 'Notes (optional)'} id={`${uid}-notes`}>
                    <textarea {...fieldProps('notes')} rows={3} value={req.notes} onChange={(e) => set('notes', e.target.value)} />
                  </Field>
                </div>
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted">
                    Estimate: <span className="font-semibold text-ink">{formatPrice(estimate(req, brand))}</span>
                    {booking.kind === 'appointment' && ' (starting price)'}
                  </p>
                  <button type="submit" className={buttonPrimary}>
                    {booking.submitLabel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function closedDaysHint(brand: Brand): string | undefined {
  const closed = [0, 1, 2, 3, 4, 5, 6].filter((d) => !brand.contact.hours[d]).map((d) => DAY_NAMES[d])
  return closed.length ? `Closed on ${closed.join(', ')}` : undefined
}

function Summary({ brand, req, onEdit }: { brand: Brand; req: BookingRequest; onEdit: () => void }) {
  const message = bookingMessage(req, brand)
  const item = brand.offerings.items.find((o) => o.id === req.offeringId)
  const [y, m, d] = req.date.split('-').map(Number)
  const day = new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div aria-live="polite">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700" aria-hidden="true">✓</span>
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">{brand.booking.successTitle}</h3>
          <p className="text-sm text-muted">{brand.booking.successText}</p>
        </div>
      </div>

      <dl className="divide-y divide-line rounded-xl border border-line">
        {[
          [brand.booking.offeringLabel, `${item?.name}${brand.booking.askQuantity ? ` × ${req.quantity}` : ''}`],
          ...(brand.booking.askStaff ? [['Stylist', req.staff]] : []),
          [brand.booking.kind === 'order' ? 'Pickup' : 'When', `${day}, ${formatTime(req.time)}`],
          ['Name', req.name],
          ['Phone', req.phone],
          ...(req.notes.trim() ? [['Notes', req.notes.trim()]] : []),
          ['Estimate', formatPrice(estimate(req, brand))],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {brand.contact.whatsapp ? (
          <a href={whatsappUrl(brand.contact.whatsapp, message)} target="_blank" rel="noreferrer" className={`${buttonPrimary} flex-1`}>
            Send on WhatsApp
          </a>
        ) : (
          <p className="flex-1 rounded-xl bg-surface-alt p-4 text-sm text-muted">
            <strong className="text-ink">Demo site:</strong> on a live website this request is sent straight to the business on
            WhatsApp with the details above. Nothing has been sent.
          </p>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="self-start rounded-full border border-line px-6 py-3 font-semibold text-ink hover:border-primary sm:self-center"
        >
          Edit details
        </button>
      </div>
    </div>
  )
}
