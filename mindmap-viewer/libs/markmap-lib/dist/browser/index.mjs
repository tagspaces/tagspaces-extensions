import { Hook, buildJSItem, buildCSSItem, loadJS, noop, wrapFunction, UrlBuilder } from "markmap-common";
import { buildTree } from "markmap-html-parser";
import MarkdownIt from "markdown-it";
import md_ins from "markdown-it-ins";
import md_mark from "markdown-it-mark";
import md_sub from "markdown-it-sub";
import md_sup from "markdown-it-sup";
import { parse } from "yaml";
import katexPluginModule from "@vscode/markdown-it-katex";
function initializeMarkdownIt() {
  const md = MarkdownIt({
    html: true,
    breaks: true
  });
  md.use(md_ins).use(md_mark).use(md_sub).use(md_sup);
  return md;
}
function createTransformHooks(transformer) {
  return {
    transformer,
    parser: new Hook(),
    beforeParse: new Hook(),
    afterParse: new Hook(),
    retransform: new Hook()
  };
}
function definePlugin(plugin2) {
  return plugin2;
}
const svgMarked = '<svg width="16" height="16" viewBox="0 -3 24 24"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"/></svg>\n';
const svgUnmarked = '<svg width="16" height="16" viewBox="0 -3 24 24"><path fill-rule="evenodd" d="M6 5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-5z" clip-rule="evenodd"/></svg>\n';
const name$5 = "checkbox";
const images = {
  " ": svgUnmarked.trim(),
  x: svgMarked.trim()
};
const plugin$3 = definePlugin({
  name: name$5,
  transform(transformHooks) {
    transformHooks.parser.tap((md) => {
      md.core.ruler.before("inline", "checkbox", (state) => {
        for (let i = 2; i < state.tokens.length; i += 1) {
          const token = state.tokens[i];
          if (token.type === "inline" && token.content) {
            const prevType = state.tokens[i - 1].type;
            const prevPrevType = state.tokens[i - 2].type;
            if (prevType === "heading_open" || prevType === "paragraph_open" && prevPrevType === "list_item_open") {
              token.content = token.content.replace(
                /^\[(.)\] /,
                (m, g) => images[g] ? `${images[g]} ` : m
              );
            }
          }
        }
        return false;
      });
    });
    return {};
  }
});
const name$4 = "frontmatter";
const pluginFrontmatter = definePlugin({
  name: name$4,
  transform(transformHooks) {
    transformHooks.beforeParse.tap((_md, context) => {
      var _a;
      const { content } = context;
      if (!/^---\r?\n/.test(content)) return;
      const match = /\n---\r?\n/.exec(content);
      if (!match) return;
      const raw = content.slice(4, match.index).trimEnd();
      let frontmatter;
      try {
        frontmatter = parse(raw.replace(/\r?\n|\r/g, "\n"));
        if (frontmatter == null ? void 0 : frontmatter.markmap) {
          frontmatter.markmap = normalizeMarkmapJsonOptions(
            frontmatter.markmap
          );
        }
      } catch {
        return;
      }
      context.frontmatter = frontmatter;
      context.parserOptions = {
        ...context.parserOptions,
        ...(_a = frontmatter == null ? void 0 : frontmatter.markmap) == null ? void 0 : _a.htmlParser
      };
      context.frontmatterInfo = {
        lines: content.slice(0, match.index).split("\n").length + 1,
        offset: match.index + match[0].length
      };
    });
    return {};
  }
});
function normalizeMarkmapJsonOptions(options) {
  if (!options) return;
  ["color", "extraJs", "extraCss"].forEach((key) => {
    if (options[key] != null) options[key] = normalizeStringArray(options[key]);
  });
  ["duration", "maxWidth", "initialExpandLevel"].forEach((key) => {
    if (options[key] != null) options[key] = normalizeNumber(options[key]);
  });
  return options;
}
function normalizeStringArray(value) {
  let result;
  if (typeof value === "string") result = [value];
  else if (Array.isArray(value))
    result = value.filter((item) => item && typeof item === "string");
  return (result == null ? void 0 : result.length) ? result : void 0;
}
function normalizeNumber(value) {
  if (isNaN(+value)) return;
  return +value;
}
function patchJSItem(urlBuilder, item) {
  if (item.type === "script" && item.data.src) {
    return {
      ...item,
      data: {
        ...item.data,
        src: urlBuilder.getFullUrl(item.data.src)
      }
    };
  }
  return item;
}
function patchCSSItem(urlBuilder, item) {
  if (item.type === "stylesheet" && item.data.href) {
    return {
      ...item,
      data: {
        ...item.data,
        href: urlBuilder.getFullUrl(item.data.href)
      }
    };
  }
  return item;
}
const name$3 = "hljs";
const preloadScripts$1 = [
  `@highlightjs/cdn-assets@${"11.11.1"}/highlight.min.js`
].map((path) => buildJSItem(path));
const styles$1 = [
  `@highlightjs/cdn-assets@${"11.11.1"}/styles/default.min.css`
].map((path) => buildCSSItem(path));
const config$1 = {
  versions: {
    hljs: "11.11.1"
  },
  preloadScripts: preloadScripts$1,
  styles: styles$1
};
const plugin$2 = definePlugin({
  name: name$3,
  config: config$1,
  transform(transformHooks) {
    var _a, _b, _c;
    let loading;
    const preloadScripts2 = ((_b = (_a = plugin$2.config) == null ? void 0 : _a.preloadScripts) == null ? void 0 : _b.map(
      (item) => patchJSItem(transformHooks.transformer.urlBuilder, item)
    )) || [];
    const autoload = () => {
      loading || (loading = loadJS(preloadScripts2));
      return loading;
    };
    let enableFeature = noop;
    transformHooks.parser.tap((md) => {
      md.set({
        highlight: (str, language) => {
          enableFeature();
          const { hljs } = window;
          if (hljs) {
            return hljs.highlightAuto(str, language ? [language] : void 0).value;
          }
          autoload().then(() => {
            transformHooks.retransform.call();
          });
          return str;
        }
      });
    });
    transformHooks.beforeParse.tap((_, context) => {
      enableFeature = () => {
        context.features[name$3] = true;
      };
    });
    return {
      styles: (_c = plugin$2.config) == null ? void 0 : _c.styles
    };
  }
});
function addDefaultVersions(paths, name2, version) {
  return paths.map((path) => {
    if (typeof path === "string" && !path.includes("://")) {
      if (!path.startsWith("npm:")) {
        path = `npm:${path}`;
      }
      const prefixLength = 4 + name2.length;
      if (path.startsWith(`npm:${name2}/`)) {
        path = `${path.slice(0, prefixLength)}@${version}${path.slice(
          prefixLength
        )}`;
      }
    }
    return path;
  });
}
var define_define_KATEX_RESOURCES_default = ["katex@0.16.18/dist/fonts/KaTeX_AMS-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Caligraphic-Bold.woff2", "katex@0.16.18/dist/fonts/KaTeX_Caligraphic-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Fraktur-Bold.woff2", "katex@0.16.18/dist/fonts/KaTeX_Fraktur-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Main-Bold.woff2", "katex@0.16.18/dist/fonts/KaTeX_Main-BoldItalic.woff2", "katex@0.16.18/dist/fonts/KaTeX_Main-Italic.woff2", "katex@0.16.18/dist/fonts/KaTeX_Main-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Math-BoldItalic.woff2", "katex@0.16.18/dist/fonts/KaTeX_Math-Italic.woff2", "katex@0.16.18/dist/fonts/KaTeX_SansSerif-Bold.woff2", "katex@0.16.18/dist/fonts/KaTeX_SansSerif-Italic.woff2", "katex@0.16.18/dist/fonts/KaTeX_SansSerif-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Script-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Size1-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Size2-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Size3-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Size4-Regular.woff2", "katex@0.16.18/dist/fonts/KaTeX_Typewriter-Regular.woff2"];
const name$2 = "katex";
const preloadScripts = [
  `katex@${"0.16.18"}/dist/katex.min.js`
].map((path) => buildJSItem(path));
const webfontloader = buildJSItem(
  `webfontloader@${"1.6.28"}/webfontloader.js`
);
webfontloader.data.defer = true;
const styles = [`katex@${"0.16.18"}/dist/katex.min.css`].map(
  (path) => buildCSSItem(path)
);
const config = {
  versions: {
    katex: "0.16.18",
    webfontloader: "1.6.28"
  },
  preloadScripts,
  scripts: [
    {
      type: "iife",
      data: {
        fn: (getMarkmap) => {
          window.WebFontConfig = {
            custom: {
              families: [
                "KaTeX_AMS",
                "KaTeX_Caligraphic:n4,n7",
                "KaTeX_Fraktur:n4,n7",
                "KaTeX_Main:n4,n7,i4,i7",
                "KaTeX_Math:i4,i7",
                "KaTeX_Script",
                "KaTeX_SansSerif:n4,n7,i4",
                "KaTeX_Size1",
                "KaTeX_Size2",
                "KaTeX_Size3",
                "KaTeX_Size4",
                "KaTeX_Typewriter"
              ]
            },
            active: () => {
              getMarkmap().refreshHook.call();
            }
          };
        },
        getParams({ getMarkmap }) {
          return [getMarkmap];
        }
      }
    },
    webfontloader
  ],
  styles,
  resources: define_define_KATEX_RESOURCES_default
};
function interop(mod) {
  return mod.default || mod;
}
const katexPlugin = interop(katexPluginModule);
const plugin$1 = definePlugin({
  name: name$2,
  config,
  transform(transformHooks) {
    var _a, _b, _c, _d;
    let loading;
    const preloadScripts2 = ((_b = (_a = plugin$1.config) == null ? void 0 : _a.preloadScripts) == null ? void 0 : _b.map(
      (item) => patchJSItem(transformHooks.transformer.urlBuilder, item)
    )) || [];
    const autoload = () => {
      loading || (loading = loadJS(preloadScripts2));
      return loading;
    };
    const renderKatex = (source, displayMode) => {
      const { katex } = window;
      if (katex) {
        return katex.renderToString(source, {
          displayMode,
          throwOnError: false
        });
      }
      autoload().then(() => {
        transformHooks.retransform.call();
      });
      return source;
    };
    let enableFeature = noop;
    transformHooks.parser.tap((md) => {
      md.use(katexPlugin);
      ["math_block", "math_inline"].forEach((key) => {
        const fn = (tokens, idx) => {
          enableFeature();
          const result = renderKatex(tokens[idx].content, !!tokens[idx].block);
          return result;
        };
        md.renderer.rules[key] = fn;
      });
    });
    transformHooks.beforeParse.tap((_, context) => {
      enableFeature = () => {
        context.features[name$2] = true;
      };
    });
    transformHooks.afterParse.tap((_, context) => {
      var _a2;
      const markmap = (_a2 = context.frontmatter) == null ? void 0 : _a2.markmap;
      if (markmap) {
        ["extraJs", "extraCss"].forEach((key) => {
          var _a3, _b2;
          const value = markmap[key];
          if (value) {
            markmap[key] = addDefaultVersions(
              value,
              name$2,
              ((_b2 = (_a3 = plugin$1.config) == null ? void 0 : _a3.versions) == null ? void 0 : _b2.katex) || ""
            );
          }
        });
      }
    });
    return {
      styles: (_c = plugin$1.config) == null ? void 0 : _c.styles,
      scripts: (_d = plugin$1.config) == null ? void 0 : _d.scripts
    };
  }
});
const name$1 = "npmUrl";
const pluginNpmUrl = definePlugin({
  name: name$1,
  transform(transformHooks) {
    transformHooks.afterParse.tap((_, context) => {
      const { frontmatter } = context;
      const markmap = frontmatter == null ? void 0 : frontmatter.markmap;
      if (markmap) {
        ["extraJs", "extraCss"].forEach((key) => {
          const value = markmap[key];
          if (value) {
            markmap[key] = value.map((path) => {
              if (path.startsWith("npm:")) {
                return transformHooks.transformer.urlBuilder.getFullUrl(
                  path.slice(4)
                );
              }
              return path;
            });
          }
        });
      }
    });
    return {};
  }
});
const name = "sourceLines";
const plugin = definePlugin({
  name,
  transform(transformHooks) {
    let frontmatterLines = 0;
    transformHooks.beforeParse.tap((_md, context) => {
      var _a;
      frontmatterLines = ((_a = context.frontmatterInfo) == null ? void 0 : _a.lines) || 0;
    });
    transformHooks.parser.tap((md) => {
      md.renderer.renderAttrs = wrapFunction(
        md.renderer.renderAttrs,
        (renderAttrs, token) => {
          if (token.block && token.map) {
            const lineRange = token.map.map((line) => line + frontmatterLines);
            token.attrSet("data-lines", lineRange.join(","));
          }
          return renderAttrs(token);
        }
      );
      if (md.renderer.rules.fence) {
        md.renderer.rules.fence = wrapFunction(
          md.renderer.rules.fence,
          (fence, tokens, idx, ...rest) => {
            let result = fence(tokens, idx, ...rest);
            const token = tokens[idx];
            if (result.startsWith("<pre>") && token.map) {
              const lineRange = token.map.map(
                (line) => line + frontmatterLines
              );
              result = result.slice(0, 4) + ` data-lines="${lineRange.join(",")}"` + result.slice(4);
            }
            return result;
          }
        );
      }
    });
    return {};
  }
});
const plugins = [
  pluginFrontmatter,
  plugin$1,
  plugin$2,
  pluginNpmUrl,
  plugin$3,
  plugin
];
const builtInPlugins = plugins;
function cleanNode(node) {
  while (!node.content && node.children.length === 1) {
    node = node.children[0];
  }
  while (node.children.length === 1 && !node.children[0].content) {
    node = {
      ...node,
      children: node.children[0].children
    };
  }
  return {
    ...node,
    children: node.children.map(cleanNode)
  };
}
class Transformer {
  constructor(plugins2 = builtInPlugins) {
    this.assetsMap = {};
    this.urlBuilder = new UrlBuilder();
    this.hooks = createTransformHooks(this);
    this.plugins = plugins2.map(
      (plugin2) => typeof plugin2 === "function" ? plugin2() : plugin2
    );
    const assetsMap = {};
    for (const { name: name2, transform } of this.plugins) {
      assetsMap[name2] = transform(this.hooks);
    }
    this.assetsMap = assetsMap;
    const md = initializeMarkdownIt();
    this.md = md;
    this.hooks.parser.call(md);
  }
  transform(content, fallbackParserOptions) {
    var _a;
    const context = {
      content,
      features: {},
      parserOptions: fallbackParserOptions
    };
    this.hooks.beforeParse.call(this.md, context);
    let { content: rawContent } = context;
    if (context.frontmatterInfo)
      rawContent = rawContent.slice(context.frontmatterInfo.offset);
    const html = this.md.render(rawContent, {});
    this.hooks.afterParse.call(this.md, context);
    const root = cleanNode(buildTree(html, context.parserOptions));
    root.content || (root.content = `${((_a = context.frontmatter) == null ? void 0 : _a.title) || ""}`);
    return { ...context, root };
  }
  resolveJS(item) {
    return patchJSItem(this.urlBuilder, item);
  }
  resolveCSS(item) {
    return patchCSSItem(this.urlBuilder, item);
  }
  /**
   * Get all assets from enabled plugins or filter them by plugin names as keys.
   */
  getAssets(keys) {
    const styles2 = [];
    const scripts = [];
    keys ?? (keys = this.plugins.map((plugin2) => plugin2.name));
    for (const assets of keys.map((key) => this.assetsMap[key])) {
      if (assets) {
        if (assets.styles) styles2.push(...assets.styles);
        if (assets.scripts) scripts.push(...assets.scripts);
      }
    }
    return {
      styles: styles2.map((item) => this.resolveCSS(item)),
      scripts: scripts.map((item) => this.resolveJS(item))
    };
  }
  /**
   * Get used assets by features object returned by `transform`.
   */
  getUsedAssets(features) {
    const keys = this.plugins.map((plugin2) => plugin2.name).filter((name2) => features[name2]);
    return this.getAssets(keys);
  }
}
const transformerVersions = {
  "markmap-lib": "0.18.11"
};
export {
  Transformer,
  builtInPlugins,
  patchCSSItem,
  patchJSItem,
  transformerVersions
};
