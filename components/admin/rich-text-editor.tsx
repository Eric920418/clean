'use client'

import { useEffect, useRef } from 'react'

import {
  ClassicEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  BlockQuote,
  Bold,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  Paragraph,
  RemoveFormat,
  Strikethrough,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
} from 'ckeditor5'

import translations from 'ckeditor5/translations/zh.js'
import 'ckeditor5/ckeditor5.css'

type Props = {
  /**
   * **只在 mount 時讀取一次**作為 initial data，之後更新 prop 不會同步進 editor。
   * 外部 reset 需求請改用 key prop 強制 re-mount。
   */
  value: string
  onContentChange: (html: string) => void
  height?: string | number
  placeholder?: string
}

/**
 * 自訂 R2 upload adapter — 取代 CKEditor 預設 Base64UploadAdapter，
 * 把編輯器內貼上 / 拖入的圖片打到 /api/admin/upload（既有 R2）。
 */
function R2UploadAdapterPlugin(editor: unknown) {
  const e = editor as {
    plugins: { get: (n: string) => { createUploadAdapter: (loader: unknown) => unknown } }
  }
  e.plugins.get('FileRepository').createUploadAdapter = (loader: unknown) => {
    const l = loader as { file: Promise<File> }
    return {
      upload: async () => {
        const file = await l.file
        const form = new FormData()
        form.append('file', file)
        form.append('folder', 'rich-text')
        const r = await fetch('/api/admin/upload', { method: 'POST', body: form })
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || '上傳失敗')
        const url = data.data?.url ?? data.url
        if (!url) throw new Error('上傳成功但缺少 URL')
        return { default: url }
      },
      abort: () => {},
    }
  }
}

/**
 * 自行用 ClassicEditor.create() 初始化，**不用** @ckeditor/ckeditor5-react wrapper。
 * 原因：v9.5.0 wrapper 在重 render / mount 順序下有 toolbar dropdown 不正確的 issue
 * （表現：點 editable 後 heading 段落 dropdown 莫名展開）。直接用原生 API 排除 wrapper 嫌疑。
 *
 * 同時拔除三個 plugin：
 *  - Mention：我們沒用 @ 提及，feeds: [{marker: '@', feed: []}] 是垃圾配置
 *  - Autosave：沒設定 save callback，留著只會跑空白 timer
 *  - Emoji：用不到、且依賴後端 emoji index
 */
export function RichTextEditor({
  value,
  onContentChange,
  height = '240px',
  placeholder,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<unknown>(null)
  // 凍住第一次的 value 與 callback，useEffect 依賴空陣列、永不重建
  const initialDataRef = useRef(value)
  const onChangeRef = useRef(onContentChange)
  const placeholderRef = useRef(placeholder)

  // 保 callback 最新（避免 stale closure）
  useEffect(() => {
    onChangeRef.current = onContentChange
  })

  useEffect(() => {
    const host = containerRef.current
    if (!host) return
    let cancelled = false

    const config = {
      toolbar: {
        items: [
          'heading',
          '|',
          'fontSize',
          'fontFamily',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'removeFormat',
          '|',
          'horizontalLine',
          'link',
          'insertImage',
          'insertTable',
          'highlight',
          'blockQuote',
          '|',
          'alignment',
          '|',
          'bulletedList',
          'numberedList',
          'todoList',
          'outdent',
          'indent',
        ],
        shouldNotGroupWhenFull: false,
      },
      plugins: [
        Alignment,
        Autoformat,
        AutoImage,
        AutoLink,
        BlockQuote,
        Bold,
        Essentials,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        Heading,
        Highlight,
        HorizontalLine,
        ImageBlock,
        ImageCaption,
        ImageInline,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        ListProperties,
        Paragraph,
        RemoveFormat,
        Strikethrough,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        TextTransformation,
        TodoList,
        Underline,
      ],
      extraPlugins: [R2UploadAdapterPlugin],
      initialData: initialDataRef.current,
      fontFamily: { supportAllValues: true },
      fontSize: { options: [10, 12, 14, 'default', 18, 20, 22], supportAllValues: true },
      heading: {
        options: [
          { model: 'paragraph' as const, title: '段落', class: 'ck-heading_paragraph' },
          { model: 'heading1' as const, view: 'h1', title: '標題 1', class: 'ck-heading_heading1' },
          { model: 'heading2' as const, view: 'h2', title: '標題 2', class: 'ck-heading_heading2' },
          { model: 'heading3' as const, view: 'h3', title: '標題 3', class: 'ck-heading_heading3' },
          { model: 'heading4' as const, view: 'h4', title: '標題 4', class: 'ck-heading_heading4' },
          { model: 'heading5' as const, view: 'h5', title: '標題 5', class: 'ck-heading_heading5' },
          { model: 'heading6' as const, view: 'h6', title: '標題 6', class: 'ck-heading_heading6' },
        ],
      },
      image: {
        toolbar: [
          'toggleImageCaption',
          'imageTextAlternative',
          '|',
          'imageStyle:inline',
          'imageStyle:wrapText',
          'imageStyle:breakText',
          '|',
          'resizeImage',
        ],
      },
      language: 'zh',
      licenseKey: 'GPL',
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
      },
      list: { properties: { styles: true, startIndex: true, reversed: true } },
      placeholder: placeholderRef.current || '在此輸入或貼上您的內容！',
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells',
          'tableProperties',
          'tableCellProperties',
        ],
      },
      translations: [translations],
    }

    ClassicEditor.create(host, config)
      .then((editor) => {
        if (cancelled) {
          editor.destroy().catch(() => {})
          return
        }
        editorRef.current = editor

        // 監聽內容變更
        editor.model.document.on('change:data', () => {
          onChangeRef.current(editor.getData())
        })

        // 啟動後強制關閉所有 toolbar dropdown，防 v44 啟動時 heading dropdown 預設展開
        const view = editor.ui.view as unknown as {
          toolbar?: { items?: Iterable<{ isOpen?: boolean }> }
        }
        const items = view.toolbar?.items
        if (items) {
          for (const item of items) {
            if (item && item.isOpen === true) item.isOpen = false
          }
        }
      })
      .catch((err) => {
        console.error('[RichTextEditor] CKEditor init failed:', err)
      })

    return () => {
      cancelled = true
      const editor = editorRef.current as { destroy?: () => Promise<void> } | null
      if (editor?.destroy) {
        editor.destroy().catch(() => {})
      }
      editorRef.current = null
    }
    // 空依賴：editor 只在 mount 時建立一次。callback / placeholder 透過 ref 保最新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cssHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div className="editor-wrapper">
      <style>{`
        .ck-editor__editable_inline {
          min-height: ${cssHeight};
          max-height: ${cssHeight};
        }
      `}</style>
      <div ref={containerRef} />
    </div>
  )
}
