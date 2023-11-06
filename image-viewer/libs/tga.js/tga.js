/**
 * @license tga-js 1.1.1
 * Copyright (c) 2013-2020 Vincent Thibault, Inc.
 * License: MIT
 */
var e, a;
(e = this),
  (a = function () {
    'use strict';
    function e(e, a) {
      for (var t = 0; t < a.length; t++) {
        var r = a[t];
        (r.enumerable = r.enumerable || !1),
          (r.configurable = !0),
          'value' in r && (r.writable = !0),
          Object.defineProperty(e, r.key, r);
      }
    }
    return (function () {
      function a() {
        !(function (e, a) {
          if (!(e instanceof a))
            throw new TypeError('Cannot call a class as a function');
        })(this, a);
      }
      var t, r, i;
      return (
        (t = a),
        (r = [
          {
            key: '_checkHeader',
            value: function () {
              var e = this.header;
              if (0 === e.imageType) throw Error('No data');
              if (e.hasColorMap) {
                if (
                  e.colorMapLength > 256 ||
                  24 !== e.colorMapDepth ||
                  1 !== e.colorMapType
                )
                  throw Error('Invalid colormap for indexed type');
              } else if (e.colorMapType)
                throw Error('Why does the image contain a palette ?');
              if (!e.width || !e.height) throw Error('Invalid image size');
              if (
                8 !== e.pixelDepth &&
                16 !== e.pixelDepth &&
                24 !== e.pixelDepth &&
                32 !== e.pixelDepth
              )
                throw Error('Invalid pixel size "' + e.pixelDepth + '"');
            },
          },
          {
            key: '_decodeRLE',
            value: function (e, a, t, r) {
              for (
                var i = new Uint8Array(r), o = new Uint8Array(t), n = 0;
                n < r;

              ) {
                var h = e[a++],
                  s = 1 + (127 & h);
                if (128 & h) {
                  for (var g = 0; g < t; ++g) o[g] = e[a + g];
                  a += t;
                  for (var l = 0; l < s; ++l) i.set(o, n), (n += t);
                } else {
                  s *= t;
                  for (var f = 0; f < s; ++f) i[n + f] = e[a + f];
                  (n += s), (a += s);
                }
              }
              return i;
            },
          },
          {
            key: '_getImageData8bits',
            value: function (e, a, t, r, i, o, n, h, s, g) {
              for (var l = 0, f = i; f !== n; f += o)
                for (var p = h; p !== g; p += s, l++) {
                  var u = a[l];
                  (e[4 * (p + r * f) + 3] = 255),
                    (e[4 * (p + r * f) + 2] = t[3 * u + 0]),
                    (e[4 * (p + r * f) + 1] = t[3 * u + 1]),
                    (e[4 * (p + r * f) + 0] = t[3 * u + 2]);
                }
              return e;
            },
          },
          {
            key: '_getImageData16bits',
            value: function (e, a, t, r, i, o, n, h, s, g) {
              for (var l = 0, f = i; f !== n; f += o)
                for (var p = h; p !== g; p += s, l += 2) {
                  var u = a[l + 0] | (a[l + 1] << 8);
                  (e[4 * (p + r * f) + 0] = (31744 & u) >> 7),
                    (e[4 * (p + r * f) + 1] = (992 & u) >> 2),
                    (e[4 * (p + r * f) + 2] = (31 & u) >> 3),
                    (e[4 * (p + r * f) + 3] = 32768 & u ? 0 : 255);
                }
              return e;
            },
          },
          {
            key: '_getImageData24bits',
            value: function (e, a, t, r, i, o, n, h, s, g) {
              for (var l = 0, f = i; f !== n; f += o)
                for (var p = h; p !== g; p += s, l += 3)
                  (e[4 * (p + r * f) + 3] = 255),
                    (e[4 * (p + r * f) + 2] = a[l + 0]),
                    (e[4 * (p + r * f) + 1] = a[l + 1]),
                    (e[4 * (p + r * f) + 0] = a[l + 2]);
              return e;
            },
          },
          {
            key: '_getImageData32bits',
            value: function (e, a, t, r, i, o, n, h, s, g) {
              for (var l = 0, f = i; f !== n; f += o)
                for (var p = h; p !== g; p += s, l += 4)
                  (e[4 * (p + r * f) + 2] = a[l + 0]),
                    (e[4 * (p + r * f) + 1] = a[l + 1]),
                    (e[4 * (p + r * f) + 0] = a[l + 2]),
                    (e[4 * (p + r * f) + 3] = a[l + 3]);
              return e;
            },
          },
          {
            key: '_getImageDataGrey8bits',
            value: function (e, a, t, r, i, o, n, h, s, g) {
              for (var l = 0, f = i; f !== n; f += o)
                for (var p = h; p !== g; p += s, l++) {
                  var u = a[l];
                  (e[4 * (p + r * f) + 0] = u),
                    (e[4 * (p + r * f) + 1] = u),
                    (e[4 * (p + r * f) + 2] = u),
                    (e[4 * (p + r * f) + 3] = 255);
                }
              return e;
            },
          },
          {
            key: '_getImageDataGrey16bits',
            value: function (e, a, t, r, i, o, n, h, s, g) {
              for (var l = 0, f = i; f !== n; f += o)
                for (var p = h; p !== g; p += s, l += 2)
                  (e[4 * (p + r * f) + 0] = a[l + 0]),
                    (e[4 * (p + r * f) + 1] = a[l + 0]),
                    (e[4 * (p + r * f) + 2] = a[l + 0]),
                    (e[4 * (p + r * f) + 3] = a[l + 1]);
              return e;
            },
          },
          {
            key: 'open',
            value: function (e, a) {
              var t = this,
                r = new XMLHttpRequest();
              (r.responseType = 'arraybuffer'),
                r.open('GET', e, !0),
                (r.onload = function () {
                  200 === r.status &&
                    (t.load(new Uint8Array(r.response)), a && a());
                }),
                r.send(null);
            },
          },
          {
            key: 'load',
            value: function (e) {
              var a = 0;
              if (e.length < 18)
                throw Error('Not enough data to contain header');
              var t = {
                idLength: e[a++],
                colorMapType: e[a++],
                imageType: e[a++],
                colorMapIndex: e[a++] | (e[a++] << 8),
                colorMapLength: e[a++] | (e[a++] << 8),
                colorMapDepth: e[a++],
                offsetX: e[a++] | (e[a++] << 8),
                offsetY: e[a++] | (e[a++] << 8),
                width: e[a++] | (e[a++] << 8),
                height: e[a++] | (e[a++] << 8),
                pixelDepth: e[a++],
                flags: e[a++],
              };
              if (
                ((t.hasEncoding =
                  9 === t.imageType ||
                  10 === t.imageType ||
                  11 === t.imageType),
                (t.hasColorMap = 9 === t.imageType || 1 === t.imageType),
                (t.isGreyColor = 11 === t.imageType || 3 === t.imageType),
                (this.header = t),
                this._checkHeader(),
                (a += t.idLength) >= e.length)
              )
                throw Error('No data');
              if (t.hasColorMap) {
                var r = t.colorMapLength * (t.colorMapDepth >> 3);
                (this.palette = e.subarray(a, a + r)), (a += r);
              }
              var i = t.pixelDepth >> 3,
                o = t.width * t.height,
                n = o * i;
              t.hasEncoding
                ? (this.imageData = this._decodeRLE(e, a, i, n))
                : (this.imageData = e.subarray(a, a + (t.hasColorMap ? o : n)));
            },
          },
          {
            key: 'getImageData',
            value: function (e) {
              var a,
                t,
                r,
                i,
                o,
                n,
                h,
                s = this.header,
                g = s.width,
                l = s.height,
                f = s.flags,
                p = s.pixelDepth,
                u = s.isGreyColor,
                c = (48 & f) >> 4;
              switch (
                (e ||
                  (e = document
                    ? document
                        .createElement('canvas')
                        .getContext('2d')
                        .createImageData(g, l)
                    : {
                        width: g,
                        height: l,
                        data: new Uint8ClampedArray(g * l * 4),
                      }),
                2 === c || 3 === c
                  ? ((i = 0), (o = 1), (n = l))
                  : ((i = l - 1), (o = -1), (n = -1)),
                2 === c || 0 === c
                  ? ((a = 0), (t = 1), (r = g))
                  : ((a = g - 1), (t = -1), (r = -1)),
                p)
              ) {
                case 8:
                  h = u ? this._getImageDataGrey8bits : this._getImageData8bits;
                  break;
                case 16:
                  h = u
                    ? this._getImageDataGrey16bits
                    : this._getImageData16bits;
                  break;
                case 24:
                  h = this._getImageData24bits;
                  break;
                case 32:
                  h = this._getImageData32bits;
              }
              return (
                h.call(
                  this,
                  e.data,
                  this.imageData,
                  this.palette,
                  g,
                  i,
                  o,
                  n,
                  a,
                  t,
                  r,
                ),
                e
              );
            },
          },
          {
            key: 'getCanvas',
            value: function () {
              var e = this.header,
                a = e.width,
                t = e.height,
                r = document.createElement('canvas'),
                i = r.getContext('2d'),
                o = i.createImageData(a, t);
              return (
                (r.width = a),
                (r.height = t),
                i.putImageData(this.getImageData(o), 0, 0),
                r
              );
            },
          },
          {
            key: 'getDataURL',
            value: function (e) {
              return this.getCanvas().toDataURL(e || 'image/png');
            },
          },
        ]) && e(t.prototype, r),
        i && e(t, i),
        a
      );
    })();
  }),
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = a())
    : 'function' == typeof define && define.amd
    ? define(a)
    : ((e = e || self).TgaLoader = a());
