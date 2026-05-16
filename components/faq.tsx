'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { RichText } from '@/components/rich-text'

type FaqItem = { id: number; question: string; answer: string }

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {items.map((item) => (
        <Accordion.Item
          key={item.id}
          value={String(item.id)}
          className="overflow-hidden rounded-xl border border-hairline bg-white"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium text-ink transition hover:bg-bg-soft data-[state=open]:bg-bg-soft">
              <span>{item.question}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-relaxed text-ink-soft data-[state=open]:animate-[fade-down_0.2s_ease]">
            <RichText html={item.answer} className="px-6 pb-5 prose-sm" />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
