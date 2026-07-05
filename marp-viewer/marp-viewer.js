/* Marp Viewer for TagSpaces - using official @marp-team/marp-core */

var filePath = getParameterByName('file');
var locale = getParameterByName('locale') || 'en';

var currentSlide = 0;
var totalSlides = 0;

// =====================
// Rendering with official Marp Core
// =====================

function renderSlides(content) {
  var marp = new Marp({
    // No html option: raw HTML in the Markdown is filtered through Marp's
    // default allowlist of known-safe tags/attributes. Passing html: true
    // would disable that and let <meta refresh>, iframes etc. through.
    math: true,
    script: false, // We load the browser script locally, not from CDN
    // Keep emoji as Unicode text — the default converts them to twemoji
    // <img> tags fetched from a third-party CDN (privacy leak, breaks offline).
    emoji: { shortcode: true, unicode: false },
  });

  var result = marp.render(content);

  // Inject Marp's generated CSS
  var styleEl = document.getElementById('marpStyles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'marpStyles';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = result.css;

  // Defense-in-depth: run DOMPurify over each slide's content on top of
  // Marp's own allowlist. The svg > foreignObject > section skeleton must be
  // left intact (DOMPurify removes foreignObject subtrees wholesale as mXSS
  // hardening), so sanitize the HTML *inside* each section — that is where
  // document-controlled markup lands. The <template> keeps the parsed nodes
  // inert (no script execution, no resource loads) until sanitized.
  var template = document.createElement('template');
  template.innerHTML = result.html;
  var sections = template.content.querySelectorAll('foreignObject > section');
  for (var s = 0; s < sections.length; s++) {
    sections[s].innerHTML = DOMPurify.sanitize(sections[s].innerHTML, {
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: /^(marp-|mjx-)/, // Marp auto-scaling + MathJax output
        attributeNameCheck: /^(jax|display)$/,
      },
    });
  }

  // Everything OUTSIDE the sanitized sections must be Marp's own skeleton
  // (div.marpit > svg > foreignObject > section). Should markup ever escape
  // a section (parser differential between Marp's tokenizer and the browser,
  // or a marp-core output change), it would bypass the per-section pass — so
  // remove any unexpected element and strip on* attributes from the skeleton.
  var skeletonTags = { DIV: true, SVG: true, FOREIGNOBJECT: true, SECTION: true };
  var allElements = template.content.querySelectorAll('*');
  for (var e = 0; e < allElements.length; e++) {
    var el = allElements[e];
    if (el.closest('foreignObject > section')) {
      continue; // inside a section — already sanitized by DOMPurify above
    }
    if (!skeletonTags[el.tagName.toUpperCase()]) {
      el.remove();
      continue;
    }
    for (var a = el.attributes.length - 1; a >= 0; a--) {
      if (/^on/i.test(el.attributes[a].name)) {
        el.removeAttribute(el.attributes[a].name);
      }
    }
  }

  // Insert the sanitized Marp HTML (div.marpit with SVGs) into the container.
  // Keep the .marpit > svg structure intact so Marp's CSS selectors work.
  var container = document.getElementById('slideContainer');
  container.innerHTML = '';
  container.appendChild(template.content);

  // Count SVG slides (don't wrap them — Marp CSS uses div.marpit > svg selectors)
  var svgSlides = container.querySelectorAll('svg[data-marpit-svg]');
  totalSlides = svgSlides.length;

  // Hide all SVGs except the active one via inline style
  for (var i = 0; i < svgSlides.length; i++) {
    svgSlides[i].setAttribute('data-slide-index', i);
    if (i !== 0) {
      svgSlides[i].style.display = 'none';
    }
  }

  // Add click navigation areas to the container (outside .marpit)
  var prevArea = document.createElement('div');
  prevArea.className = 'nav-area nav-area-prev';
  prevArea.innerHTML = '<span class="nav-arrow">&#9664;</span>';
  prevArea.addEventListener('click', prevSlide);
  container.appendChild(prevArea);

  var nextArea = document.createElement('div');
  nextArea.className = 'nav-area nav-area-next';
  nextArea.innerHTML = '<span class="nav-arrow">&#9654;</span>';
  nextArea.addEventListener('click', nextSlide);
  container.appendChild(nextArea);

  // Show first slide
  currentSlide = 0;
  showSlide(currentSlide);

  // Load Marp browser script AFTER slides are in the DOM.
  // This script registers custom elements and runs the SVG polyfill
  // that applies transforms to section elements inside foreignObject.
  var browserScript = document.createElement('script');
  browserScript.src = 'libs/marp-browser.js';
  document.body.appendChild(browserScript);
}

// =====================
// Slide Navigation
// =====================

function showSlide(index) {
  var svgSlides = document.querySelectorAll('svg[data-marpit-svg]');
  if (svgSlides.length === 0) return;

  if (index < 0) index = 0;
  if (index >= svgSlides.length) index = svgSlides.length - 1;
  currentSlide = index;

  for (var i = 0; i < svgSlides.length; i++) {
    svgSlides[i].style.display = i === currentSlide ? '' : 'none';
  }

  var counter = document.getElementById('slideCounter');
  if (counter) {
    counter.textContent = (currentSlide + 1) + ' / ' + totalSlides;
  }
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    showSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    showSlide(currentSlide - 1);
  }
}

// =====================
// Keyboard Navigation
// =====================

document.addEventListener('keydown', function (e) {
  if (
    e.target.tagName === 'INPUT' ||
    e.target.tagName === 'TEXTAREA' ||
    e.target.isContentEditable
  ) {
    return;
  }

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case ' ':
    case 'PageDown':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      prevSlide();
      break;
    case 'Home':
      e.preventDefault();
      showSlide(0);
      break;
    case 'End':
      e.preventDefault();
      showSlide(totalSlides - 1);
      break;
  }
});

// =====================
// TagSpaces Integration
// =====================

document.addEventListener('readystatechange', function () {
  if (document.readyState === 'complete') {
    insertAboutDialog('https://docs.tagspaces.org/extensions/marp-viewer');
    insertLoadingAnimation();
    insertPrintMenuItem();
    insertZoomContentMenuItem();
    insertToggleFindMenuItem();

    initI18N(locale, 'ns.extension.json');
    sendMessageToHost({ command: 'loadDefaultTextContent' });

    // Zoom settings
    var extSettings = loadExtSettings('marpViewerSettings');
    var zoomLevel = 100;
    if (extSettings && extSettings.zoomLevel) {
      if (extSettings.zoomLevel >= 30 && extSettings.zoomLevel <= 500) {
        zoomLevel = extSettings.zoomLevel;
      }
    }

    function saveSettings() {
      saveExtSettings('marpViewerSettings', { zoomLevel: zoomLevel });
    }

    saveSettings();

    document
      .getElementById('zoomInButton')
      .addEventListener('click', function (e) {
        e.stopPropagation();
        zoomLevel = Math.min(zoomLevel + 10, 500);
        saveSettings();
        document.getElementById('slideViewport').style.zoom = zoomLevel + '%';
      });

    document
      .getElementById('zoomOutButton')
      .addEventListener('click', function (e) {
        e.stopPropagation();
        zoomLevel = Math.max(zoomLevel - 10, 30);
        saveSettings();
        document.getElementById('slideViewport').style.zoom = zoomLevel + '%';
      });

    document
      .getElementById('zoomResetButton')
      .addEventListener('click', function (e) {
        zoomLevel = 100;
        saveSettings();
        document.getElementById('slideViewport').style.zoom = zoomLevel + '%';
      });
  }
});

// Called by TagSpaces to set the file content
function setContent(content, fileDirectory) {
  var UTF8_BOM = '\uFEFF';
  if (content.indexOf(UTF8_BOM) === 0) {
    content = content.substring(1);
  }

  renderSlides(content);

  initFindToolbar();
  hideLoadingAnimation();

  handleLinks(document.getElementById('slideContainer'), fileDirectory);
  fixingEmbeddingOfLocalImages(
    document.getElementById('slideContainer'),
    fileDirectory,
  );
}
