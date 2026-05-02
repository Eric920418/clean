import {
  Wind,
  WashingMachine,
  Droplets,
  ShieldCheck,
  Filter,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  Wind,
  WashingMachine,
  Droplets,
  ShieldCheck,
  Filter,
  Sparkles,
}

type Props = {
  name: string
  className?: string
  strokeWidth?: number
}

export function IconByName({ name, className, strokeWidth = 1.8 }: Props) {
  const Icon = map[name] ?? Sparkles
  return <Icon className={className} strokeWidth={strokeWidth} />
}
