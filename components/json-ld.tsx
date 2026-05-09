/**
 * 注入 JSON-LD 結構化資料給 Google
 *
 * 為何不用 dangerouslySetInnerHTML：將 JSON 字串中的 `<` `>` `&` 預先轉成 `\u00XX` Unicode escape，
 * JSON parser 會自動解碼回字面字元，但 React 在 <script> 子節點中不會做 HTML 跳脫，
 * 從而既保留 XSS 防護又輸出正確 JSON-LD。
 */
function safeJsonStringify(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json">{safeJsonStringify(data)}</script>
  )
}
