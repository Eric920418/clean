'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'

import {
  DecoupledEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BlockQuote,
  Bold,
  Emoji,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
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
  Mention,
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
  /** mount 時讀取一次作為 initial data，之後 prop 變動不影響 editor */
  value: string
  onContentChange: (html: string) => void
  height?: string | number
  placeholder?: string
  /**
   * 是否在標題下拉多開放「標題 4」。
   * 預設 false（只有 段落/標題2/標題3，站台通用內文嵌在區塊 H2 之下）。
   * 內容自成一頁、頁面 H1 由標題擔任時（如一般 FAQ 答案 → /faq/[slug]，H1=問題）設 true。
   */
  allowHeading4?: boolean
}

/**
 * 自訂 R2 upload adapter — 取代 CKEditor 預設 Base64UploadAdapter。
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

export function RichTextEditor({
  value,
  onContentChange,
  height = 'clamp(400px, 60vh, 720px)',
  placeholder,
  allowHeading4 = false,
}: Props) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  // 凍住 mount 時的 value 作為 initialData，避免每次 prop 變動就重 init
  const initialDataRef = useRef(value)

  useEffect(() => {
    setIsReady(true)
    return () => setIsReady(false)
  }, [])

  /**
   * DecoupledEditor 的 toolbar 跟 editable 是物理分離的兩個 DOM element。
   * onReady 後把 CKEditor 內部生成的 toolbar element 塞進外部 toolbarRef div。
   * 照官方 React + DecoupledEditor 範例做、不要自己發明。
   */
  const handleEditorReady = (editor: unknown) => {
    const ed = editor as { ui: { view: { toolbar: { element: HTMLElement | null } } } }
    const toolbarEl = ed.ui.view.toolbar.element
    if (toolbarRef.current && toolbarEl) {
      toolbarRef.current.appendChild(toolbarEl)
    }
  }

  /**
   * DecoupledEditor + React wrapper：editor destroy 時 toolbar element 仍會留在 toolbarRef 內、
   * 下次 mount 會出兩個 toolbar 疊起來。手動清空。
   */
  const handleAfterDestroy = () => {
    if (toolbarRef.current) {
      Array.from(toolbarRef.current.children).forEach((child) => child.remove())
    }
  }

  const editorConfig = useMemo(() => {
    if (!isReady) return {}

    return {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'heading',
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
          'emoji',
          'horizontalLine',
          'link',
          'insertImage',
          'htmlEmbed',
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
        Autosave,
        BlockQuote,
        Bold,
        Emoji,
        Essentials,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        Heading,
        Highlight,
        HorizontalLine,
        HtmlEmbed,
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
        Mention,
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
      fontFamily: {
        supportAllValues: true,
      },
      fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true,
      },
      heading: {
        // 預設只保留 H2/H3：頁面主標 H1 由頁面框架掌控，富文本內僅允許次級標題，
        // 配合 lib/sanitize-html.ts 的降級收口，確保不破壞 SEO 標題階級。
        // allowHeading4=true 時多開放標題4（內容自成一頁、H1=標題本身的情境，如一般 FAQ 答案）。
        options: [
          {
            model: 'paragraph' as const,
            title: '段落',
            class: 'ck-heading_paragraph',
          },
          {
            model: 'heading2' as const,
            view: 'h2',
            title: '標題 2',
            class: 'ck-heading_heading2',
          },
          {
            model: 'heading3' as const,
            view: 'h3',
            title: '標題 3',
            class: 'ck-heading_heading3',
          },
          ...(allowHeading4
            ? [
                {
                  model: 'heading4' as const,
                  view: 'h4',
                  title: '標題 4',
                  class: 'ck-heading_heading4',
                },
              ]
            : []),
        ],
      },
      htmlEmbed: {
        // 開 in-editor 預覽（業主貼進來馬上看到按鈕渲染樣子）。
        // XSS 防線靠 lib/sanitize-html.ts（API 寫入 + 前台 render 各過一次）；
        // 這個 callback 是 CKEditor 在「預覽」前自己再清一次的鉤子，目的是讓 dev console 不要
        // 警告 sanitizeHtml 未配置。預覽用的 sanitize 不會持久化，僅 admin 顯示。
        showPreviews: true,
        sanitizeHtml: (html: string) => ({ html, hasChanged: false }),
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
        decorators: {
          toggleDownloadable: {
            mode: 'manual' as const,
            label: '可下載',
            attributes: {
              download: 'file',
            },
          },
        },
      },
      list: {
        properties: {
          styles: true,
          startIndex: true,
          reversed: true,
        },
      },
      mention: {
        feeds: [
          {
            marker: '@',
            feed: [],
          },
        ],
      },
      placeholder: placeholder || '在此輸入或貼上您的內容！',
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
  }, [isReady, allowHeading4])

  const handleEditorChange = (_event: unknown, editor: unknown) => {
    const e = editor as { getData: () => string }
    const data = e.getData()
    if (onContentChange) {
      onContentChange(data)
    }
  }

  return (
    <div className="editor-wrapper">
      <style>{`
        .editor-toolbar-container {
          border: 1px solid var(--color-hairline, #e5e7eb);
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
          background: #fafafa;
        }
        .editor-content-container {
          border: 1px solid var(--color-hairline, #e5e7eb);
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .editor-content-container .ck-editor__editable {
          min-height: ${typeof height === 'number' ? `${height}px` : height};
          max-height: ${typeof height === 'number' ? `${height}px` : height};
          overflow-y: auto;
          border: none !important;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .editor-content-container .ck-editor__editable.ck-focused {
          box-shadow: none !important;
        }
      `}</style>
      <div ref={toolbarRef} className="editor-toolbar-container" />
      <div ref={editorRef} className="editor-content-container">
        {isReady && (
          <CKEditor
            editor={DecoupledEditor}
            data={initialDataRef.current}
            config={editorConfig}
            onChange={handleEditorChange}
            onReady={handleEditorReady}
            onAfterDestroy={handleAfterDestroy}
          />
        )}
      </div>
    </div>
  )
}
