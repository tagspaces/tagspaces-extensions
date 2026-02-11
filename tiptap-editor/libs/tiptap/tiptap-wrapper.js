// index.js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'

// Create the global tiptap object
window.tiptap = {
  Editor,
  StarterKit,
  Underline,
  Placeholder,
  Link
}