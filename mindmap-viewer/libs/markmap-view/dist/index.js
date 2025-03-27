import { Hook as dt, getId as pt, debounce as gt, addClass as ut, walkTree as R, noop as X } from "markmap-common";
import { loadCSS as ze, loadJS as we } from "markmap-common";
import { scaleOrdinal as Y, schemeCategory10 as mt, linkHorizontal as ft, zoomTransform as w, select as xt, zoom as yt, min as G, max as V, zoomIdentity as kt, minIndex as vt } from "d3";
const Z = typeof navigator < "u" && navigator.userAgent.includes("Macintosh"), bt = Y(mt), q = (e = 1, t = 3, i = 2) => (n) => e + t / i ** n.state.depth, J = {
  autoFit: !1,
  duration: 500,
  embedGlobalCSS: !0,
  fitRatio: 0.95,
  maxInitialScale: 2,
  scrollForPan: Z,
  initialExpandLevel: -1,
  zoom: !0,
  pan: !0,
  toggleRecursively: !1,
  color: (e) => {
    var t;
    return bt(`${((t = e.state) == null ? void 0 : t.path) || ""}`);
  },
  lineWidth: q(),
  maxWidth: 0,
  nodeMinHeight: 16,
  paddingX: 8,
  spacingHorizontal: 80,
  spacingVertical: 5
};
function ke(e) {
  const t = {}, i = { ...e }, { color: n, colorFreezeLevel: s, lineWidth: a } = i;
  if ((n == null ? void 0 : n.length) === 1) {
    const l = n[0];
    t.color = () => l;
  } else if (n != null && n.length) {
    const l = Y(n);
    t.color = (h) => l(`${h.state.path}`);
  }
  if (s) {
    const l = t.color || J.color;
    t.color = (h) => (h = {
      ...h,
      state: {
        ...h.state,
        path: h.state.path.split(".").slice(0, s).join(".")
      }
    }, l(h));
  }
  if (a) {
    const l = Array.isArray(a) ? a : [a, 0, 1];
    t.lineWidth = q(
      ...l
    );
  }
  return [
    "duration",
    "fitRatio",
    "initialExpandLevel",
    "maxInitialScale",
    "maxWidth",
    "nodeMinHeight",
    "paddingX",
    "spacingHorizontal",
    "spacingVertical"
  ].forEach((l) => {
    const h = i[l];
    typeof h == "number" && (t[l] = h);
  }), ["zoom", "pan"].forEach((l) => {
    const h = i[l];
    h != null && (t[l] = !!h);
  }), t;
}
function Et(e) {
  let t = 0;
  for (let i = 0; i < e.length; i++)
    t = (t << 5) - t + e.charCodeAt(i) | 0;
  return (t >>> 0).toString(36);
}
function v(e) {
  if (typeof e == "string") {
    const i = e;
    e = (n) => n.matches(i);
  }
  const t = e;
  return function() {
    let n = Array.from(this.childNodes);
    return t && (n = n.filter((s) => t(s))), n;
  };
}
function zt(e) {
  var t = 0, i = e.children, n = i && i.length;
  if (!n) t = 1;
  else for (; --n >= 0; ) t += i[n].value;
  e.value = t;
}
function wt() {
  return this.eachAfter(zt);
}
function Ct(e) {
  var t = this, i, n = [t], s, a, c;
  do
    for (i = n.reverse(), n = []; t = i.pop(); )
      if (e(t), s = t.children, s) for (a = 0, c = s.length; a < c; ++a)
        n.push(s[a]);
  while (n.length);
  return this;
}
function St(e) {
  for (var t = this, i = [t], n, s; t = i.pop(); )
    if (e(t), n = t.children, n) for (s = n.length - 1; s >= 0; --s)
      i.push(n[s]);
  return this;
}
function Rt(e) {
  for (var t = this, i = [t], n = [], s, a, c; t = i.pop(); )
    if (n.push(t), s = t.children, s) for (a = 0, c = s.length; a < c; ++a)
      i.push(s[a]);
  for (; t = n.pop(); )
    e(t);
  return this;
}
function Xt(e) {
  return this.eachAfter(function(t) {
    for (var i = +e(t.data) || 0, n = t.children, s = n && n.length; --s >= 0; ) i += n[s].value;
    t.value = i;
  });
}
function jt(e) {
  return this.eachBefore(function(t) {
    t.children && t.children.sort(e);
  });
}
function _t(e) {
  for (var t = this, i = Ot(t, e), n = [t]; t !== i; )
    t = t.parent, n.push(t);
  for (var s = n.length; e !== i; )
    n.splice(s, 0, e), e = e.parent;
  return n;
}
function Ot(e, t) {
  if (e === t) return e;
  var i = e.ancestors(), n = t.ancestors(), s = null;
  for (e = i.pop(), t = n.pop(); e === t; )
    s = e, e = i.pop(), t = n.pop();
  return s;
}
function Mt() {
  for (var e = this, t = [e]; e = e.parent; )
    t.push(e);
  return t;
}
function At() {
  var e = [];
  return this.each(function(t) {
    e.push(t);
  }), e;
}
function Tt() {
  var e = [];
  return this.eachBefore(function(t) {
    t.children || e.push(t);
  }), e;
}
function Ht() {
  var e = this, t = [];
  return e.each(function(i) {
    i !== e && t.push({ source: i.parent, target: i });
  }), t;
}
function H(e, t) {
  var i = new j(e), n = +e.value && (i.value = e.value), s, a = [i], c, o, l, h;
  for (t == null && (t = Ft); s = a.pop(); )
    if (n && (s.value = +s.data.value), (o = t(s.data)) && (h = o.length))
      for (s.children = new Array(h), l = h - 1; l >= 0; --l)
        a.push(c = s.children[l] = new j(o[l])), c.parent = s, c.depth = s.depth + 1;
  return i.eachBefore(Dt);
}
function Bt() {
  return H(this).eachBefore(Lt);
}
function Ft(e) {
  return e.children;
}
function Lt(e) {
  e.data = e.data.data;
}
function Dt(e) {
  var t = 0;
  do
    e.height = t;
  while ((e = e.parent) && e.height < ++t);
}
function j(e) {
  this.data = e, this.depth = this.height = 0, this.parent = null;
}
j.prototype = H.prototype = {
  constructor: j,
  count: wt,
  each: Ct,
  eachAfter: Rt,
  eachBefore: St,
  sum: Xt,
  sort: jt,
  path: _t,
  ancestors: Mt,
  descendants: At,
  leaves: Tt,
  links: Ht,
  copy: Bt
};
const $t = "d3-flextree", Nt = "2.1.2", Wt = "build/d3-flextree.js", It = "index", Pt = { name: "Chris Maloney", url: "http://chrismaloney.org" }, Kt = "Flexible tree layout algorithm that allows for variable node sizes.", Gt = ["d3", "d3-module", "layout", "tree", "hierarchy", "d3-hierarchy", "plugin", "d3-plugin", "infovis", "visualization", "2d"], Vt = "https://github.com/klortho/d3-flextree", Ut = "WTFPL", Yt = { type: "git", url: "https://github.com/klortho/d3-flextree.git" }, Zt = { clean: "rm -rf build demo test", "build:demo": "rollup -c --environment BUILD:demo", "build:dev": "rollup -c --environment BUILD:dev", "build:prod": "rollup -c --environment BUILD:prod", "build:test": "rollup -c --environment BUILD:test", build: "rollup -c", lint: "eslint index.js src", "test:main": "node test/bundle.js", "test:browser": "node test/browser-tests.js", test: "npm-run-all test:*", prepare: "npm-run-all clean build lint test" }, qt = { "d3-hierarchy": "^1.1.5" }, Jt = { "babel-plugin-external-helpers": "^6.22.0", "babel-preset-es2015-rollup": "^3.0.0", d3: "^4.13.0", "d3-selection-multi": "^1.0.1", eslint: "^4.19.1", jsdom: "^11.6.2", "npm-run-all": "^4.1.2", rollup: "^0.55.3", "rollup-plugin-babel": "^2.7.1", "rollup-plugin-commonjs": "^8.0.2", "rollup-plugin-copy": "^0.2.3", "rollup-plugin-json": "^2.3.0", "rollup-plugin-node-resolve": "^3.0.2", "rollup-plugin-uglify": "^3.0.0", "uglify-es": "^3.3.9" }, Qt = {
  name: $t,
  version: Nt,
  main: Wt,
  module: It,
  "jsnext:main": "index",
  author: Pt,
  description: Kt,
  keywords: Gt,
  homepage: Vt,
  license: Ut,
  repository: Yt,
  scripts: Zt,
  dependencies: qt,
  devDependencies: Jt
}, { version: te } = Qt, ee = Object.freeze({
  children: (e) => e.children,
  nodeSize: (e) => e.data.size,
  spacing: 0
});
function tt(e) {
  const t = Object.assign({}, ee, e);
  function i(o) {
    const l = t[o];
    return typeof l == "function" ? l : () => l;
  }
  function n(o) {
    const l = c(a(), o, (h) => h.children);
    return l.update(), l.data;
  }
  function s() {
    const o = i("nodeSize"), l = i("spacing");
    return class Q extends H.prototype.constructor {
      constructor(d) {
        super(d);
      }
      copy() {
        const d = c(this.constructor, this, (g) => g.children);
        return d.each((g) => g.data = g.data.data), d;
      }
      get size() {
        return o(this);
      }
      spacing(d) {
        return l(this, d);
      }
      get nodes() {
        return this.descendants();
      }
      get xSize() {
        return this.size[0];
      }
      get ySize() {
        return this.size[1];
      }
      get top() {
        return this.y;
      }
      get bottom() {
        return this.y + this.ySize;
      }
      get left() {
        return this.x - this.xSize / 2;
      }
      get right() {
        return this.x + this.xSize / 2;
      }
      get root() {
        const d = this.ancestors();
        return d[d.length - 1];
      }
      get numChildren() {
        return this.hasChildren ? this.children.length : 0;
      }
      get hasChildren() {
        return !this.noChildren;
      }
      get noChildren() {
        return this.children === null;
      }
      get firstChild() {
        return this.hasChildren ? this.children[0] : null;
      }
      get lastChild() {
        return this.hasChildren ? this.children[this.numChildren - 1] : null;
      }
      get extents() {
        return (this.children || []).reduce(
          (d, g) => Q.maxExtents(d, g.extents),
          this.nodeExtents
        );
      }
      get nodeExtents() {
        return {
          top: this.top,
          bottom: this.bottom,
          left: this.left,
          right: this.right
        };
      }
      static maxExtents(d, g) {
        return {
          top: Math.min(d.top, g.top),
          bottom: Math.max(d.bottom, g.bottom),
          left: Math.min(d.left, g.left),
          right: Math.max(d.right, g.right)
        };
      }
    };
  }
  function a() {
    const o = s(), l = i("nodeSize"), h = i("spacing");
    return class extends o {
      constructor(d) {
        super(d), Object.assign(this, {
          x: 0,
          y: 0,
          relX: 0,
          prelim: 0,
          shift: 0,
          change: 0,
          lExt: this,
          lExtRelX: 0,
          lThr: null,
          rExt: this,
          rExtRelX: 0,
          rThr: null
        });
      }
      get size() {
        return l(this.data);
      }
      spacing(d) {
        return h(this.data, d.data);
      }
      get x() {
        return this.data.x;
      }
      set x(d) {
        this.data.x = d;
      }
      get y() {
        return this.data.y;
      }
      set y(d) {
        this.data.y = d;
      }
      update() {
        return et(this), rt(this), this;
      }
    };
  }
  function c(o, l, h) {
    const d = (g, u) => {
      const m = new o(g);
      Object.assign(m, {
        parent: u,
        depth: u === null ? 0 : u.depth + 1,
        height: 0,
        length: 1
      });
      const x = h(g) || [];
      return m.children = x.length === 0 ? null : x.map((y) => d(y, m)), m.children && Object.assign(m, m.children.reduce(
        (y, k) => ({
          height: Math.max(y.height, k.height + 1),
          length: y.length + k.length
        }),
        m
      )), m;
    };
    return d(l, null);
  }
  return Object.assign(n, {
    nodeSize(o) {
      return arguments.length ? (t.nodeSize = o, n) : t.nodeSize;
    },
    spacing(o) {
      return arguments.length ? (t.spacing = o, n) : t.spacing;
    },
    children(o) {
      return arguments.length ? (t.children = o, n) : t.children;
    },
    hierarchy(o, l) {
      const h = typeof l > "u" ? t.children : l;
      return c(s(), o, h);
    },
    dump(o) {
      const l = i("nodeSize"), h = (d) => (g) => {
        const u = d + "  ", m = d + "    ", { x, y } = g, k = l(g), b = g.children || [], z = b.length === 0 ? " " : `,${u}children: [${m}${b.map(h(m)).join(m)}${u}],${d}`;
        return `{ size: [${k.join(", ")}],${u}x: ${x}, y: ${y}${z}},`;
      };
      return h(`
`)(o);
    }
  }), n;
}
tt.version = te;
const et = (e, t = 0) => (e.y = t, (e.children || []).reduce((i, n) => {
  const [s, a] = i;
  et(n, e.y + e.ySize);
  const c = (s === 0 ? n.lExt : n.rExt).bottom;
  s !== 0 && ne(e, s, a);
  const o = de(c, s, a);
  return [s + 1, o];
}, [0, null]), re(e), he(e), e), rt = (e, t, i) => {
  typeof t > "u" && (t = -e.relX - e.prelim, i = 0);
  const n = t + e.relX;
  return e.relX = n + e.prelim - i, e.prelim = 0, e.x = i + e.relX, (e.children || []).forEach((s) => rt(s, n, e.x)), e;
}, re = (e) => {
  (e.children || []).reduce((t, i) => {
    const [n, s] = t, a = n + i.shift, c = s + a + i.change;
    return i.relX += c, [a, c];
  }, [0, 0]);
}, ne = (e, t, i) => {
  const n = e.children[t - 1], s = e.children[t];
  let a = n, c = n.relX, o = s, l = s.relX, h = !0;
  for (; a && o; ) {
    a.bottom > i.lowY && (i = i.next);
    const d = c + a.prelim - (l + o.prelim) + a.xSize / 2 + o.xSize / 2 + a.spacing(o);
    (d > 0 || d < 0 && h) && (l += d, ie(s, d), se(e, t, i.index, d)), h = !1;
    const g = a.bottom, u = o.bottom;
    g <= u && (a = ae(a), a && (c += a.relX)), g >= u && (o = oe(o), o && (l += o.relX));
  }
  !a && o ? le(e, t, o, l) : a && !o && ce(e, t, a, c);
}, ie = (e, t) => {
  e.relX += t, e.lExtRelX += t, e.rExtRelX += t;
}, se = (e, t, i, n) => {
  const s = e.children[t], a = t - i;
  if (a > 1) {
    const c = n / a;
    e.children[i + 1].shift += c, s.shift -= c, s.change -= n - c;
  }
}, oe = (e) => e.hasChildren ? e.firstChild : e.lThr, ae = (e) => e.hasChildren ? e.lastChild : e.rThr, le = (e, t, i, n) => {
  const s = e.firstChild, a = s.lExt, c = e.children[t];
  a.lThr = i;
  const o = n - i.relX - s.lExtRelX;
  a.relX += o, a.prelim -= o, s.lExt = c.lExt, s.lExtRelX = c.lExtRelX;
}, ce = (e, t, i, n) => {
  const s = e.children[t], a = s.rExt, c = e.children[t - 1];
  a.rThr = i;
  const o = n - i.relX - s.rExtRelX;
  a.relX += o, a.prelim -= o, s.rExt = c.rExt, s.rExtRelX = c.rExtRelX;
}, he = (e) => {
  if (e.hasChildren) {
    const t = e.firstChild, i = e.lastChild, n = (t.prelim + t.relX - t.xSize / 2 + i.relX + i.prelim + i.xSize / 2) / 2;
    Object.assign(e, {
      prelim: n,
      lExt: t.lExt,
      lExtRelX: t.lExtRelX,
      rExt: i.rExt,
      rExtRelX: i.rExtRelX
    });
  }
}, de = (e, t, i) => {
  for (; i !== null && e >= i.lowY; )
    i = i.next;
  return {
    lowY: e,
    index: t,
    next: i
  };
}, nt = ".markmap{--markmap-max-width: 9999px;--markmap-a-color: #0097e6;--markmap-a-hover-color: #00a8ff;--markmap-code-bg: #f0f0f0;--markmap-code-color: #555;--markmap-highlight-bg: #ffeaa7;--markmap-table-border: 1px solid currentColor;--markmap-font: 300 16px/20px sans-serif;--markmap-circle-open-bg: #fff;--markmap-text-color: #333;--markmap-highlight-node-bg: #ff02;font:var(--markmap-font);color:var(--markmap-text-color)}.markmap-link{fill:none}.markmap-node>circle{cursor:pointer}.markmap-foreign{display:inline-block}.markmap-foreign p{margin:0}.markmap-foreign a{color:var(--markmap-a-color)}.markmap-foreign a:hover{color:var(--markmap-a-hover-color)}.markmap-foreign code{padding:.25em;font-size:calc(1em - 2px);color:var(--markmap-code-color);background-color:var(--markmap-code-bg);border-radius:2px}.markmap-foreign pre{margin:0}.markmap-foreign pre>code{display:block}.markmap-foreign del{text-decoration:line-through}.markmap-foreign em{font-style:italic}.markmap-foreign strong{font-weight:700}.markmap-foreign mark{background:var(--markmap-highlight-bg)}.markmap-foreign table,.markmap-foreign th,.markmap-foreign td{border-collapse:collapse;border:var(--markmap-table-border)}.markmap-foreign img{display:inline-block}.markmap-foreign svg{fill:currentColor}.markmap-foreign>div{width:var(--markmap-max-width);text-align:left}.markmap-foreign>div>div{display:inline-block}.markmap-highlight rect{fill:var(--markmap-highlight-node-bg)}.markmap-dark .markmap{--markmap-code-bg: #1a1b26;--markmap-code-color: #ddd;--markmap-circle-open-bg: #444;--markmap-text-color: #eee}", ve = nt, M = "g.markmap-node", pe = "path.markmap-link", ge = "g.markmap-highlight", A = ft();
function U(e, t) {
  const i = vt(e, t);
  return e[i];
}
function T(e) {
  e.stopPropagation();
}
const ue = new dt();
class it {
  constructor(t, i) {
    this.options = { ...J }, this._disposeList = [], this.handleZoom = (n) => {
      const { transform: s } = n;
      this.g.attr("transform", s);
    }, this.handlePan = (n) => {
      n.preventDefault();
      const s = w(this.svg.node()), a = s.translate(
        -n.deltaX / s.k,
        -n.deltaY / s.k
      );
      this.svg.call(this.zoom.transform, a);
    }, this.handleClick = (n, s) => {
      let a = this.options.toggleRecursively;
      (Z ? n.metaKey : n.ctrlKey) && (a = !a), this.toggleNode(s, a);
    }, this.ensureView = this.ensureVisible, this.svg = t.datum ? t : xt(t), this.styleNode = this.svg.append("style"), this.zoom = yt().filter((n) => this.options.scrollForPan && n.type === "wheel" ? n.ctrlKey && !n.button : (!n.ctrlKey || n.type === "wheel") && !n.button).on("zoom", this.handleZoom), this.setOptions(i), this.state = {
      id: this.options.id || this.svg.attr("id") || pt(),
      rect: { x1: 0, y1: 0, x2: 0, y2: 0 }
    }, this.g = this.svg.append("g"), this.g.append("g").attr("class", "markmap-highlight"), this._observer = new ResizeObserver(
      gt(() => {
        this.renderData();
      }, 100)
    ), this._disposeList.push(
      ue.tap(() => {
        this.setData();
      }),
      () => this._observer.disconnect()
    );
  }
  getStyleContent() {
    const { style: t } = this.options, { id: i } = this.state, n = typeof t == "function" ? t(i) : "";
    return [this.options.embedGlobalCSS && nt, n].filter(Boolean).join(`
`);
  }
  updateStyle() {
    this.svg.attr(
      "class",
      ut(this.svg.attr("class"), "markmap", this.state.id)
    );
    const t = this.getStyleContent();
    this.styleNode.text(t);
  }
  async toggleNode(t, i = !1) {
    var s, a;
    const n = (s = t.payload) != null && s.fold ? 0 : 1;
    i ? R(t, (c, o) => {
      c.payload = {
        ...c.payload,
        fold: n
      }, o();
    }) : t.payload = {
      ...t.payload,
      fold: (a = t.payload) != null && a.fold ? 0 : 1
    }, await this.renderData(t);
  }
  _initializeData(t) {
    let i = 0;
    const { color: n, initialExpandLevel: s } = this.options;
    let a = 0, c = 0;
    return R(t, (o, l, h) => {
      var g, u, m, x;
      c += 1, o.children = (g = o.children) == null ? void 0 : g.map((y) => ({ ...y })), i += 1, o.state = {
        ...o.state,
        depth: c,
        id: i,
        rect: {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        },
        size: [0, 0]
      }, o.state.key = [(u = h == null ? void 0 : h.state) == null ? void 0 : u.id, o.state.id].filter(Boolean).join(".") + Et(o.content), o.state.path = [(m = h == null ? void 0 : h.state) == null ? void 0 : m.path, o.state.id].filter(Boolean).join("."), n(o);
      const d = ((x = o.payload) == null ? void 0 : x.fold) === 2;
      d ? a += 1 : (a || s >= 0 && o.state.depth >= s) && (o.payload = { ...o.payload, fold: 1 }), l(), d && (a -= 1), c -= 1;
    }), t;
  }
  _relayout() {
    if (!this.state.data) return;
    this.g.selectAll(v(M)).selectAll(
      v("foreignObject")
    ).each(function(l) {
      var g;
      const h = (g = this.firstChild) == null ? void 0 : g.firstChild, d = [h.scrollWidth, h.scrollHeight];
      l.state.size = d;
    });
    const { lineWidth: t, paddingX: i, spacingHorizontal: n, spacingVertical: s } = this.options, a = tt({}).children((l) => {
      var h;
      if (!((h = l.payload) != null && h.fold)) return l.children;
    }).nodeSize((l) => {
      const [h, d] = l.data.state.size;
      return [d, h + (h ? i * 2 : 0) + n];
    }).spacing((l, h) => (l.parent === h.parent ? s : s * 2) + t(l.data)), c = a.hierarchy(this.state.data);
    a(c);
    const o = c.descendants();
    o.forEach((l) => {
      const h = l.data;
      h.state.rect = {
        x: l.y,
        y: l.x - l.xSize / 2,
        width: l.ySize - n,
        height: l.xSize
      };
    }), this.state.rect = {
      x1: G(o, (l) => l.data.state.rect.x) || 0,
      y1: G(o, (l) => l.data.state.rect.y) || 0,
      x2: V(
        o,
        (l) => l.data.state.rect.x + l.data.state.rect.width
      ) || 0,
      y2: V(
        o,
        (l) => l.data.state.rect.y + l.data.state.rect.height
      ) || 0
    };
  }
  setOptions(t) {
    this.options = {
      ...this.options,
      ...t
    }, this.options.zoom ? this.svg.call(this.zoom) : this.svg.on(".zoom", null), this.options.pan ? this.svg.on("wheel", this.handlePan) : this.svg.on("wheel", null);
  }
  async setData(t, i) {
    i && this.setOptions(i), t && (this.state.data = this._initializeData(t)), this.state.data && (this.updateStyle(), await this.renderData());
  }
  async setHighlight(t) {
    this.state.highlight = t || void 0, await this.renderData();
  }
  _getHighlightRect(t) {
    const i = this.svg.node(), s = 4 / w(i).k, a = {
      ...t.state.rect
    };
    return a.x -= s, a.y -= s, a.width += 2 * s, a.height += 2 * s, a;
  }
  async renderData(t) {
    const { paddingX: i, autoFit: n, color: s, maxWidth: a, lineWidth: c } = this.options, o = this.state.data;
    if (!o) return;
    const l = {}, h = {}, d = [];
    R(o, (r, p, f) => {
      var E;
      (E = r.payload) != null && E.fold || p(), l[r.state.id] = r, f && (h[r.state.id] = f.state.id), d.push(r);
    });
    const g = {}, u = {}, m = (r) => {
      !r || g[r.state.id] || R(r, (p, f) => {
        g[p.state.id] = r.state.id, f();
      });
    }, x = (r) => u[g[r.state.id]] || o.state.rect, y = (r) => (l[g[r.state.id]] || o).state.rect;
    u[o.state.id] = o.state.rect, t && m(t);
    let { highlight: k } = this.state;
    k && !l[k.state.id] && (k = void 0);
    let b = this.g.selectAll(v(ge)).selectAll(v("rect")).data(k ? [this._getHighlightRect(k)] : []).join("rect").attr("x", (r) => r.x).attr("y", (r) => r.y).attr("width", (r) => r.width).attr("height", (r) => r.height);
    const z = this.g.selectAll(v(M)).each((r) => {
      u[r.state.id] = r.state.rect;
    }).data(d, (r) => r.state.key), B = z.enter().append("g").attr("data-depth", (r) => r.state.depth).attr("data-path", (r) => r.state.path).each((r) => {
      m(l[h[r.state.id]]);
    }), C = z.exit().each((r) => {
      m(l[h[r.state.id]]);
    }), S = z.merge(B).attr(
      "class",
      (r) => {
        var p;
        return ["markmap-node", ((p = r.payload) == null ? void 0 : p.fold) && "markmap-fold"].filter(Boolean).join(" ");
      }
    ), F = S.selectAll(v("line")).data(
      (r) => [r],
      (r) => r.state.key
    ), L = F.enter().append("line").attr("stroke", (r) => s(r)).attr("stroke-width", 0), D = F.merge(L), $ = S.selectAll(v("circle")).data(
      (r) => {
        var p;
        return (p = r.children) != null && p.length ? [r] : [];
      },
      (r) => r.state.key
    ), N = $.enter().append("circle").attr("stroke-width", 0).attr("r", 0).on("click", (r, p) => this.handleClick(r, p)).on("mousedown", T).merge($).attr("stroke", (r) => s(r)).attr(
      "fill",
      (r) => {
        var p;
        return (p = r.payload) != null && p.fold && r.children ? s(r) : "var(--markmap-circle-open-bg)";
      }
    ), W = this._observer, I = S.selectAll(v("foreignObject")).data(
      (r) => [r],
      (r) => r.state.key
    ), _ = I.enter().append("foreignObject").attr("class", "markmap-foreign").attr("x", i).attr("y", 0).style("opacity", 0).on("mousedown", T).on("dblclick", T);
    _.append("xhtml:div").append("xhtml:div").html((r) => r.content).attr("xmlns", "http://www.w3.org/1999/xhtml"), _.each(function() {
      var p;
      const r = (p = this.firstChild) == null ? void 0 : p.firstChild;
      W.observe(r);
    });
    const P = C.selectAll(
      v("foreignObject")
    );
    P.each(function() {
      var p;
      const r = (p = this.firstChild) == null ? void 0 : p.firstChild;
      W.unobserve(r);
    });
    const K = _.merge(I), st = d.flatMap(
      (r) => {
        var p;
        return (p = r.payload) != null && p.fold ? [] : r.children.map((f) => ({ source: r, target: f }));
      }
    ), O = this.g.selectAll(v(pe)).data(st, (r) => r.target.state.key), ot = O.exit(), at = O.enter().insert("path", "g").attr("class", "markmap-link").attr("data-depth", (r) => r.target.state.depth).attr("data-path", (r) => r.target.state.path).attr("d", (r) => {
      const p = x(r.target), f = [
        p.x + p.width,
        p.y + p.height
      ];
      return A({ source: f, target: f });
    }).attr("stroke-width", 0).merge(O);
    this.svg.style(
      "--markmap-max-width",
      a ? `${a}px` : null
    ), await new Promise(requestAnimationFrame), this._relayout(), b = b.data(k ? [this._getHighlightRect(k)] : []).join("rect"), this.transition(b).attr("x", (r) => r.x).attr("y", (r) => r.y).attr("width", (r) => r.width).attr("height", (r) => r.height), B.attr("transform", (r) => {
      const p = x(r);
      return `translate(${p.x + p.width - r.state.rect.width},${p.y + p.height - r.state.rect.height})`;
    }), this.transition(C).attr("transform", (r) => {
      const p = y(r), f = p.x + p.width - r.state.rect.width, E = p.y + p.height - r.state.rect.height;
      return `translate(${f},${E})`;
    }).remove(), this.transition(S).attr(
      "transform",
      (r) => `translate(${r.state.rect.x},${r.state.rect.y})`
    );
    const lt = C.selectAll(
      v("line")
    );
    this.transition(lt).attr("x1", (r) => r.state.rect.width).attr("stroke-width", 0), L.attr("x1", (r) => r.state.rect.width).attr("x2", (r) => r.state.rect.width), D.attr("y1", (r) => r.state.rect.height + c(r) / 2).attr("y2", (r) => r.state.rect.height + c(r) / 2), this.transition(D).attr("x1", -1).attr("x2", (r) => r.state.rect.width + 2).attr("stroke", (r) => s(r)).attr("stroke-width", c);
    const ct = C.selectAll(
      v("circle")
    );
    this.transition(ct).attr("r", 0).attr("stroke-width", 0), N.attr("cx", (r) => r.state.rect.width).attr("cy", (r) => r.state.rect.height + c(r) / 2), this.transition(N).attr("r", 6).attr("stroke-width", "1.5"), this.transition(P).style("opacity", 0), K.attr("width", (r) => Math.max(0, r.state.rect.width - i * 2)).attr("height", (r) => r.state.rect.height), this.transition(K).style("opacity", 1), this.transition(ot).attr("d", (r) => {
      const p = y(r.target), f = [
        p.x + p.width,
        p.y + p.height + c(r.target) / 2
      ];
      return A({ source: f, target: f });
    }).attr("stroke-width", 0).remove(), this.transition(at).attr("stroke", (r) => s(r.target)).attr("stroke-width", (r) => c(r.target)).attr("d", (r) => {
      const p = r.source, f = r.target, E = [
        p.state.rect.x + p.state.rect.width,
        p.state.rect.y + p.state.rect.height + c(p) / 2
      ], ht = [
        f.state.rect.x,
        f.state.rect.y + f.state.rect.height + c(f) / 2
      ];
      return A({ source: E, target: ht });
    }), n && this.fit();
  }
  transition(t) {
    const { duration: i } = this.options;
    return t.transition().duration(i);
  }
  /**
   * Fit the content to the viewport.
   */
  async fit(t = this.options.maxInitialScale) {
    const i = this.svg.node(), { width: n, height: s } = i.getBoundingClientRect(), { fitRatio: a } = this.options, { x1: c, y1: o, x2: l, y2: h } = this.state.rect, d = l - c, g = h - o, u = Math.min(
      n / d * a,
      s / g * a,
      t
    ), m = kt.translate(
      (n - d * u) / 2 - c * u,
      (s - g * u) / 2 - o * u
    ).scale(u);
    return this.transition(this.svg).call(this.zoom.transform, m).end().catch(X);
  }
  findElement(t) {
    let i;
    return this.g.selectAll(v(M)).each(function(s) {
      s === t && (i = {
        data: s,
        g: this
      });
    }), i;
  }
  /**
   * Pan the content to make the provided node visible in the viewport.
   */
  async ensureVisible(t, i) {
    var k;
    const n = (k = this.findElement(t)) == null ? void 0 : k.data;
    if (!n) return;
    const s = this.svg.node(), a = s.getBoundingClientRect(), c = w(s), [o, l] = [
      n.state.rect.x,
      n.state.rect.x + n.state.rect.width + 2
    ].map((b) => b * c.k + c.x), [h, d] = [
      n.state.rect.y,
      n.state.rect.y + n.state.rect.height
    ].map((b) => b * c.k + c.y), g = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      ...i
    }, u = [g.left - o, a.width - g.right - l], m = [g.top - h, a.height - g.bottom - d], x = u[0] * u[1] > 0 ? U(u, Math.abs) / c.k : 0, y = m[0] * m[1] > 0 ? U(m, Math.abs) / c.k : 0;
    if (x || y) {
      const b = c.translate(x, y);
      return this.transition(this.svg).call(this.zoom.transform, b).end().catch(X);
    }
  }
  async centerNode(t, i) {
    var x;
    const n = (x = this.findElement(t)) == null ? void 0 : x.data;
    if (!n) return;
    const s = this.svg.node(), a = s.getBoundingClientRect(), c = w(s), o = (n.state.rect.x + n.state.rect.width / 2) * c.k + c.x, l = (n.state.rect.y + n.state.rect.height / 2) * c.k + c.y, h = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      ...i
    }, d = (h.left + a.width - h.right) / 2, g = (h.top + a.height - h.bottom) / 2, u = (d - o) / c.k, m = (g - l) / c.k;
    if (u || m) {
      const y = c.translate(u, m);
      return this.transition(this.svg).call(this.zoom.transform, y).end().catch(X);
    }
  }
  /**
   * Scale content with it pinned at the center of the viewport.
   */
  async rescale(t) {
    const i = this.svg.node(), { width: n, height: s } = i.getBoundingClientRect(), a = n / 2, c = s / 2, o = w(i), l = o.translate(
      (a - o.x) * (1 - t) / o.k,
      (c - o.y) * (1 - t) / o.k
    ).scale(t);
    return this.transition(this.svg).call(this.zoom.transform, l).end().catch(X);
  }
  destroy() {
    this.svg.on(".zoom", null), this.svg.html(null), this._disposeList.forEach((t) => {
      t();
    });
  }
  static create(t, i, n = null) {
    const s = new it(t, i);
    return n && s.setData(n).then(() => {
      s.fit();
    }), s;
  }
}
export {
  it as Markmap,
  v as childSelector,
  bt as defaultColorFn,
  J as defaultOptions,
  ke as deriveOptions,
  ve as globalCSS,
  Z as isMacintosh,
  q as lineWidthFactory,
  ze as loadCSS,
  we as loadJS,
  ue as refreshHook,
  Et as simpleHash
};
