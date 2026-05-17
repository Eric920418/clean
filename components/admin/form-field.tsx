import { cn } from '@/lib/utils'

type FieldProps = {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, required, hint, error, children, className }: FieldProps) {
  /**
   * ⚠️ 不要把外層 div 改回 <label>。
   *
   * HTML <label> 元素的標準行為：點 label 內任何非 form-control 區域 → 瀏覽器自動把
   * click + focus 轉發到 label 內第一個 focusable form control（input / button / textarea / select）。
   *
   * 對純 input/textarea/select 沒問題，但對 RichTextEditor（CKEditor）會造成致命 bug：
   * contenteditable 不被視為 labelable element，所以點編輯區會被 label forward 到 toolbar
   * 第一個 button（undo / bold），導致：
   *   1. user 點輸入框 → toolbar 第一個按鈕被「點擊」（active + tooltip 跳出）
   *   2. focus 跑到 button、沒進入 contenteditable
   *   3. user 完全無法打字
   *
   * 之前花很多時間追「CKEditor v44 internal bug」、升級到 v47、改用 DecoupledEditor —
   * 全部修錯方向。真正根因是 <label> 把 RichTextEditor 包起來。
   *
   * 用 <div> 後 user 點 input/textarea/select 本身仍能正常 focus（瀏覽器原生行為），
   * 只失去「點 label 文字也能 forward focus」這個 nice-to-have。
   */
  return (
    <div className={cn('block', className)}>
      <span className="mb-2 inline-block text-base font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
      {hint && !error && (
        <p className="mt-2 text-base text-ink-soft leading-relaxed">{hint}</p>
      )}
      {error && (
        <p
          className="mt-2 rounded-md bg-danger px-4 py-2.5 text-base font-medium text-white"
          role="alert"
        >
          ⚠ {error}
        </p>
      )}
    </div>
  )
}

// 表單元素統一 class — min-height 48px 由 globals.css .admin-friendly 提供
export const inputClass =
  'w-full px-4 py-3 border border-hairline rounded-lg bg-white text-base focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition placeholder:text-ink-muted'

export const textareaClass = inputClass + ' resize-none leading-relaxed'
