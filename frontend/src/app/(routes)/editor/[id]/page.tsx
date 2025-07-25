"use client"

import { useParams } from 'next/navigation'
import Editor from "./components/Editor"

export default function EditorPage() {
  const params = useParams()
  const templateId = params.id as string


  return <Editor templateId={templateId} />

}
