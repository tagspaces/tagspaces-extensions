import React, { useImperativeHandle } from 'react';
import { replaceAll } from '@milkdown/utils';
import { EditorStatus } from '@milkdown/core';
import type { Editor } from '@milkdown/kit/core';
import { getMarkdown, insert } from '@milkdown/kit/utils';
import { Crepe } from '@milkdown/crepe';
import { useSearchDialogContext } from './dialogs/useSearchDialogContext';

export interface MilkdownRef {
  update: (markdown: string) => void;
  insert: (markdown: string) => void;
  setEditMode: (isEditMode: boolean) => void;
  openSearchDialog: () => void;
  getMarkdown: () => string;
  getFrontmatter: () => string | null;
  updateFrontmatter: (frontmatter: string | null) => void;
  destroy: () => void;
}

export function useCrepeHandler(
  ref: React.Ref<MilkdownRef>,
  getCrepe: () => Crepe | undefined,
  get: () => Editor | undefined,
  loading: boolean,
  frontmatterRef: React.MutableRefObject<string | null>,
) {
  const { openSearchDialog } = useSearchDialogContext();
  useImperativeHandle(ref, () => ({
    update: (markdown: string) => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor.action(replaceAll(markdown));
    },
    insert: (markdown: string) => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor.action(insert(markdown));
    },
    setEditMode: (isEditable: boolean) => {
      const crepe = getCrepe();
      if (crepe) {
        crepe.setReadonly(!isEditable);
      }
      /*const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor.config((ctx: Ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          editable: () => isEditable,
        }));
      });*/
    },
    openSearchDialog: () => {
      openSearchDialog();
    },
    getMarkdown: (): string => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created)
        return '';
      return editor.action(getMarkdown());
    },
    getFrontmatter: (): string | null => {
      return frontmatterRef.current;
    },
    updateFrontmatter: (frontmatter: string | null) => {
      frontmatterRef.current = frontmatter;
    },
    destroy: () => {
      const crepe = getCrepe();
      if (crepe) {
        crepe.destroy();
      }
      /* const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor?.destroy();*/
    },
  }));
}
