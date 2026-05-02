'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ServiceOption = { id: number; name: string }

export function ContactForm({ services }: { services: ServiceOption[] }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [preferDate, setPreferDate] = useState('')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function toggleService(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim()) {
      setError('請至少填寫姓名與聯絡電話')
      return
    }
    if (selectedIds.length === 0) {
      setError('請至少選擇一項想諮詢的服務')
      return
    }

    setSubmitting(true)
    try {
      // 後端 API 串接前的 placeholder：模擬 600ms 後成功
      await new Promise((r) => setTimeout(r, 600))
      // 真實接 API：
      // const res = await fetch('/api/inquiries', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, phone, email, serviceIds: selectedIds, preferDate, address, message }),
      // })
      // if (!res.ok) throw new Error((await res.json()).error ?? '送出失敗')
      setDone(true)
      toast.success('預約已送出！我們會在 30 分鐘內聯繫您。')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      toast.error(`送出失敗：${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-primary-soft bg-bg-tint p-10 text-center">
        <h3 className="text-2xl font-medium text-ink">已收到您的預約 ✓</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          專人將在 30 分鐘內與您聯繫，敬請留意來電。
          <br />
          若有急件需求，歡迎直接撥打服務專線。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="姓名" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="您的稱呼"
          />
        </Field>
        <Field label="聯絡電話" required>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input"
            placeholder="0900-000-000"
            inputMode="tel"
          />
        </Field>
      </div>

      <Field label="電子郵件（選填）">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          placeholder="you@example.com"
        />
      </Field>

      <Field label="想諮詢的服務" required>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => {
            const selected = selectedIds.includes(s.id)
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm transition',
                  selected
                    ? 'border-primary bg-primary text-white'
                    : 'border-hairline bg-white text-ink-soft hover:border-primary-soft hover:text-primary-deep',
                )}
              >
                {s.name}
              </button>
            )
          })}
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="希望服務日期">
          <input
            type="date"
            value={preferDate}
            onChange={(e) => setPreferDate(e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="服務區域（概略）">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-input"
            placeholder="台北市信義區"
          />
        </Field>
      </div>

      <Field label="補充說明">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="form-input resize-none"
          placeholder="例如：分離式冷氣 2 台、洗衣機是滾筒款"
        />
      </Field>

      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            送出中…
          </>
        ) : (
          <>
            送出預約
            <Send className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-xs text-ink-muted">
        送出表單即表示您同意我們以您填寫的資訊與您聯繫。
      </p>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border-radius: 0.5rem;
          border: 1px solid var(--hairline);
          background: var(--bg-base);
          color: var(--ink);
          font-size: 0.95rem;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .form-input::placeholder { color: var(--ink-muted); }
        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
      `}</style>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 inline-block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      {children}
    </label>
  )
}
