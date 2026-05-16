'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  value: string
  onContentChange: (html: string) => void
  height?: string | number
  placeholder?: string
}

/**
 * 自訂 R2 upload adapter — 取代 CKEditor 預設 Base64UploadAdapter，
 * 把編輯器內貼上 / 拖入的圖片打到 /api/admin/upload（既有 R2）。
 * 這樣 HTML 內只存 URL 不存 base64，避免 longDesc 等欄位被一張圖撐到 hundreds of KB。
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
  height = '240px',
  placeholder,
}: Props) {
  const [isReady, setIsReady] = useState(false)
  const lastEmittedRef = useRef(value)

  useEffect(() => {
    setIsReady(true)
    return () => setIsReady(false)
  }, [])

  const editorConfig = useMemo(() => {
    if (!isReady) return null

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
        decorators: {
          toggleDownloadable: {
            mode: 'manual' as const,
            label: '可下載',
            attributes: { download: 'file' },
          },
        },
      },
      list: { properties: { styles: true, startIndex: true, reversed: true } },
      mention: { feeds: [{ marker: '@', feed: [] }] },
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
  }, [isReady, placeholder])

  function handleEditorChange(_event: unknown, editor: unknown) {
    const e = editor as { getData: () => string }
    const data = e.getData()
    lastEmittedRef.current = data
    onContentChange(data)
  }

  const cssHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div className="editor-wrapper">
      <style>{`
        .ck-editor__editable_inline {
          min-height: ${cssHeight};
          max-height: ${cssHeight};
        }
      `}</style>
      {isReady && editorConfig && (
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={value}
          onChange={handleEditorChange}
        />
      )}
    </div>
  )
}
