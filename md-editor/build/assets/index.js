import{E as e,d as t,l as n,e as o,c as i,a as r,t as s,m as d,h as a,b as c,f as l,s as u,g as m}from"./vendor.js";!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver((e=>{for(const n of e)if("childList"===n.type)for(const e of n.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&t(e)})).observe(document,{childList:!0,subtree:!0})}function t(e){if(e.ep)return;e.ep=!0;const t=function(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),"use-credentials"===e.crossorigin?t.credentials="include":"anonymous"===e.crossorigin?t.credentials="omit":t.credentials="same-origin",t}(e);fetch(e.href,t)}}(),document.URL.indexOf("file:///android_asset");const f=p("file"),w=document.URL.startsWith("http")&&!document.URL.startsWith("http://localhost:1212/")||f.startsWith("http");function p(e){const t=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]"),n=new RegExp("[\\?&]"+t+"=([^&#]*)").exec(location.search);let o=null===n?"":decodeURIComponent(n[1].replace(/\+/g," "));return o.includes("#")&&(o=o.split("#").join("%23")),o}function g(e){window.parent.postMessage(JSON.stringify(e),"*")}function h(e){return 0===e.indexOf("http://")||0===e.indexOf("https://")||0===e.indexOf("file://")||0===e.indexOf("data:")}navigator.appVersion.includes("Win"),navigator.userAgent.toLowerCase().indexOf(" electron/");g({command:"loadDefaultTextContent"});const y={markdown:[e=>{window.editMode&&g({command:"contentChangedInEditor"}),window.mdContent=e()}]};window.addEventListener("keyup",(e=>{window.editMode&&(e.ctrlKey||e.metaKey)&&"s"===e.key.toLowerCase()?g({command:"saveDocument"}):(e.ctrlKey||e.metaKey)&&"p"===e.key.toLowerCase()&&window.print()})),window.addEventListener("dblclick",(e=>{window.editMode||g({command:"editDocument"})})),window.addEventListener("contentLoaded",(()=>{(async function(){const f=()=>window.editMode;window.editMode?await(new e).config((e=>{e.set(t,window.mdContent),e.set(n,y),e.set(o,{editable:f})})).use(i).use(r).use(s).use(d).use(a).use(c).use(l).use(u).use(m).create():await(new e).config((e=>{e.set(t,window.mdContent),e.set(o,{editable:f})})).use(i).use(r).use(s).use(d).create()})().then((()=>{const e=document.getElementsByClassName("milkdown");if(e.length>0){if(!window.editMode){[...e[0].getElementsByTagName("a")].forEach((e=>{let t,n=e.getAttribute("href");0===n.indexOf("#")||(h(n)||(t=(w?"":"file://")+window.fileDirectory+"/"+encodeURIComponent(n),e.setAttribute("href",t)),e.addEventListener("click",(e=>{e.preventDefault(),g({command:"openLinkExternally",link:t||n})})))}))}[...e[0].getElementsByTagName("img")].forEach((e=>{console.log(e.getAttribute("src"));const t=e.getAttribute("src");if(!h(t)){const n=(w?"":"file://")+window.fileDirectory+"/"+t;e.setAttribute("src",n)}}))}return!0})).catch((e=>{console.warn("Error creating md-editor: "+e)}))}));"dark"===p("theme")&&document.documentElement.setAttribute("data-theme","dark");
