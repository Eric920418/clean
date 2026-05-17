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
    return () => setIsReady(false)
  }, [])

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
            />
          )}
        </div>
      </div>
    </div>
  )
}
