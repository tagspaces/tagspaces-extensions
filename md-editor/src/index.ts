import { defaultValueCtx, Editor } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { emoji } from "@milkdown/plugin-emoji";

import "@milkdown/theme-nord/lib/theme.css";
import "@milkdown/preset-commonmark/lib/style.css";
import "@milkdown/plugin-emoji/lib/style.css";
import "./extension.css";

Editor.make()
  .config((ctx) => {
    ctx.set(defaultValueCtx, "# Milkdown :heartpulse: Vanilla");
  })
  .use(commonmark)
  .use(emoji)
  .create();
