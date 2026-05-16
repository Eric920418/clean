'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'

import {
  ClassicEditor,
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

/**
 * 結構完全照搬 seminar/src/components/CustomEditor.tsx（這個在 seminar production 已驗證無 bug）。
 *
 * 與 seminar 差異只有 2 處：
 *  1. 加 `value: string` prop 並把 `initialData` 從 '' 改為 value（編輯既有內容必需）
 *  2. 把 Base64UploadAdapter 換成 R2UploadAdapter（圖片不塞 base64、走 R2）
 *
 * 其他全部跟 seminar 一致 — plugin list、config、wrapper、useMemo、useEffect、render 結構。
 * 之前我做的「拔掉 Mention/Autosave/Emoji」「改用 native init」全部還原 — 排除「我自己搞壞」的可能。
 */
export function RichTextEditor({
  value,
  onContentChange,
  height = '200px',
  placeholder,
}: Props) {
  const editorContainerRef = useRef(null)
  const editorRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  // 凍住 mount 時的 value 作為 initialData，避免每次 prop 變動就重 init
  const initialDataRef = useRef(value)

  useEffect(() => {
    setIsReady(true)
    // Deploy 驗證標記：production console 看到這條才代表新版 bundle 已生效
    // eslint-disable-next-line no-console
    console.log('[RichTextEditor v10] mounted — intercept toolbar dropdowns on editor mousedown')
    return () => setIsReady(false)
  }, [])

  const editorConfig = useMemo(() => {
    if (!isReady) return {}

    return {
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
          'emoji',
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
        options: [
          {
            model: 'paragraph' as const,
            title: '段落',
            class: 'ck-heading_paragraph',
          },
          {
            model: 'heading1' as const,
            view: 'h1',
            title: '標題 1',
            class: 'ck-heading_heading1',
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
          {
            model: 'heading4' as const,
            view: 'h4',
            title: '標題 4',
            class: 'ck-heading_heading4',
          },
          {
            model: 'heading5' as const,
            view: 'h5',
            title: '標題 5',
            class: 'ck-heading_heading5',
          },
          {
            model: 'heading6' as const,
            view: 'h6',
            title: '標題 6',
            class: 'ck-heading_heading6',
          },
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
      initialData: initialDataRef.current,
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
  }, [isReady])

  const handleEditorChange = (_event: unknown, editor: unknown) => {
    const e = editor as { getData: () => string }
    const data = e.getData()
    if (onContentChange) {
      onContentChange(data)
    }
  }

  /**
   * CKEditor 5 v44 internal bug 修補：
   * click editable area → CKEditor 自動把 toolbar 第一個 dropdown open + focus 跳進去。
   * 拔掉 'heading' 變 'fontSize'、bug 跟著轉移到 fontSize → 證實是「位置依賴」、不是 plugin bug。
   *
   * 攔截：editable focus 時、強制把 toolbar 內所有 dropdown 的 isOpen 設回 false。
   */
  /**
   * CKEditor 5 v44 bug — 已本地 reproduce 確認流程：
   *   1. user mousedown 在 editable area
   *   2. CKEditor 在 mousedown 內 preventDefault、focus 沒進 contenteditable
   *   3. CKEditor 把 focus 跳到 toolbar 第一個 dropdown panel 第一個選項
   *   4. → 該 dropdown 被 open（aria-expanded=true、panel display=block）
   * 拔掉 'heading' bug 轉移到 'fontSize'，證實是「toolbar 第一個 dropdown 位置」
   * 依賴的內部 bug，跟特定 plugin 無關。
   *
   * 修補：在 mount 後直接 DOM-level 監聽 editor wrapper 的 mousedown，
   * 等 CKEditor 內部把 dropdown open 完、再強制把 isOpen 設回 false。
   * 不能用 editor.editing.view.document.on('focus')，因為 focus 根本沒進 editable。
   */
  const handleEditorReady = (editor: unknown) => {
    const ed = editor as {
      ui: {
        view: {
          element?: HTMLElement
          toolbar?: { items?: Iterable<{ isOpen?: boolean }> }
        }
      }
    }
    const root = ed.ui.view.element
    if (!root) return

    const closeAllDropdowns = () => {
      const items = ed.ui.view.toolbar?.items
      if (!items) return
      for (const item of items) {
        if (item && item.isOpen === true) item.isOpen = false
      }
    }

    // mousedown 後 CKEditor 會在 microtask 內把 dropdown open
    // 用兩階段延遲確保攔截到「open 完才 close」
    root.addEventListener('mousedown', () => {
      requestAnimationFrame(() => {
        closeAllDropdowns()
        setTimeout(closeAllDropdowns, 50)
      })
    })
  }

  return (
    <div className="editor-wrapper">
      <style>{`
        .ck-editor__editable_inline {
          min-height: ${typeof height === 'number' ? `${height}px` : height};
          max-height: ${typeof height === 'number' ? `${height}px` : height};
        }
      `}</style>
      <div className="editor-container" ref={editorContainerRef}>
        <div className="editor-container__editor" ref={editorRef}>
          {isReady && (
            <CKEditor
              editor={ClassicEditor}
              config={editorConfig}
              onChange={handleEditorChange}
              onReady={handleEditorReady}
            />
          )}
        </div>
      </div>
    </div>
  )
}
