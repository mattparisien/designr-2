"use client"

import { useParams } from 'next/navigation'
import Editor from "./components/Editor"

export default function EditorPage() {
  const params = useParams()
  const compositionId = params.id as string

  return <Editor compositionId={compositionId} />

}
