import React from 'react';
import { Editor, rootCtx } from '@milkdown/core';
import { ReactEditor, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

const MilkdownEditor: React.FC = () => {
  const editor = useEditor(root =>
    new Editor()
      .config(ctx => {
        ctx.set(rootCtx, root);
      })
      .use(commonmark)
  );

  return <ReactEditor editor={editor} />;
};

export default MilkdownEditor;
