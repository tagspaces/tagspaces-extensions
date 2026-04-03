/* Marp Viewer for TagSpaces */

const filePath = getParameterByName('file');
const locale = getParameterByName('locale') || 'en';

let currentSlide = 0;
let slides = [];
let globalDirectives = {};

// Marked.js configuration
marked.setOptions({
  pedantic: false,
  gfm: true,
  breaks: false,
  smartLists: true,
  smartypants: false,
  xhtml: true,
});

// =====================
// Front Matter & Directive Parsing
// =====================

function parseFrontMatter(content) {
  const trimmed = content.replace(/^\uFEFF/, '').trim();
  // Match front matter: starts with --- on first line, ends with ---
  const match = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { directives: {}, body: trimmed };
  }
  const yamlBlock = match[1];
  const body = match[2];
  const directives = parseSimpleYaml(yamlBlock);
  return { directives, body };
}

function parseSimpleYaml(yaml) {
  const result = {};
  const lines = yaml.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.substring(0, colonIdx).trim();
    let value = line.substring(colonIdx + 1).trim();
    // Remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Boolean/number coercion
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^\d+$/.test(value)) value = parseInt(value, 10);
    result[key] = value;
  }
  return result;
}

function parseSlideDirectives(markdown) {
  // Parse <!-- directives --> comments for per-slide config
  const directives = {};
  const cleaned = markdown.replace(
    /<!--\s*([\s\S]*?)\s*-->/g,
    function (match, inner) {
      const lines = inner.trim().split('\n');
      let isDirective = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.indexOf(':') !== -1) {
          const parsed = parseSimpleYaml(line);
          for (var key in parsed) {
            if (parsed.hasOwnProperty(key)) {
              directives[key] = parsed[key];
              isDirective = true;
            }
          }
        }
      }
      return isDirective ? '' : match;
    },
  );
  return { directives, content: cleaned };
}

// =====================
// Slide Splitting
// =====================

function splitSlides(body) {
  // Split on lines that are exactly --- (with optional whitespace)
  // But not lines inside code blocks
  var result = [];
  var current = [];
  var inCodeBlock = false;
  var lines = body.split('\n');

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    // Track fenced code blocks
    if (line.trim().indexOf('```') === 0) {
      inCodeBlock = !inCodeBlock;
      current.push(line);
      continue;
    }
    // Slide separator: line is exactly --- (with optional spaces)
    if (!inCodeBlock && /^\s*---\s*$/.test(line)) {
      result.push(current.join('\n'));
      current = [];
      continue;
    }
    current.push(line);
  }
  // Push last slide
  if (current.length > 0) {
    result.push(current.join('\n'));
  }
  // Remove empty first slide if content was empty
  if (result.length > 0 && result[0].trim() === '') {
    result.shift();
  }
  return result;
}

// =====================
// Rendering
// =====================

function renderSlides(content) {
  var parsed = parseFrontMatter(content);
  globalDirectives = parsed.directives;
  var slideTexts = splitSlides(parsed.body);

  slides = [];
  for (var i = 0; i < slideTexts.length; i++) {
    var slideData = parseSlideDirectives(slideTexts[i]);
    slides.push({
      markdown: slideData.content,
      directives: slideData.directives,
    });
  }

  // Apply theme
  var theme = globalDirectives.theme || 'default';
  var container = document.getElementById('slideContainer');
  container.className = 'theme-' + theme;

  // Apply aspect ratio
  if (globalDirectives.size === '4:3') {
    container.classList.add('ratio-4-3');
  }

  // Build slide DOM
  container.innerHTML = '';
  for (var i = 0; i < slides.length; i++) {
    var slide = slides[i];
    var slideEl = document.createElement('div');
    slideEl.className = 'marp-slide';

    // Per-slide classes (e.g. <!-- class: lead -->)
    var slideClass = slide.directives['class'] || globalDirectives['class'];
    if (slideClass) {
      slideEl.classList.add(slideClass);
    }

    // Per-slide background color
    var bgColor =
      slide.directives.backgroundColor || globalDirectives.backgroundColor;
    if (bgColor) {
      slideEl.style.backgroundColor = bgColor;
    }

    // Per-slide text color
    var textColor = slide.directives.color || globalDirectives.color;
    if (textColor) {
      slideEl.style.color = textColor;
    }

    // Header
    var header = slide.directives.header || globalDirectives.header;
    if (header) {
      var headerEl = document.createElement('div');
      headerEl.className = 'marp-header';
      headerEl.textContent = header;
      slideEl.appendChild(headerEl);
    }

    // Footer
    var footer = slide.directives.footer || globalDirectives.footer;
    if (footer) {
      var footerEl = document.createElement('div');
      footerEl.className = 'marp-footer';
      footerEl.textContent = footer;
      slideEl.appendChild(footerEl);
    }

    // Pagination
    var paginate = slide.directives.paginate;
    if (paginate === undefined || paginate === null) {
      paginate = globalDirectives.paginate;
    }
    if (paginate === true || paginate === 'true') {
      var pageEl = document.createElement('div');
      pageEl.className = 'marp-pagination';
      pageEl.textContent = (i + 1) + ' / ' + slides.length;
      slideEl.appendChild(pageEl);
    }

    // Slide content
    var contentEl = document.createElement('div');
    contentEl.className = 'marp-slide-content';
    var htmlContent = marked.parse(slide.markdown.trim());
    contentEl.innerHTML = DOMPurify.sanitize(htmlContent);
    slideEl.appendChild(contentEl);

    container.appendChild(slideEl);
  }

  // Add navigation areas
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
  scaleSlides();
}

function showSlide(index) {
  var slideEls = document.querySelectorAll('.marp-slide');
  if (slideEls.length === 0) return;

  // Clamp index
  if (index < 0) index = 0;
  if (index >= slideEls.length) index = slideEls.length - 1;
  currentSlide = index;

  for (var i = 0; i < slideEls.length; i++) {
    slideEls[i].classList.remove('active');
  }
  slideEls[currentSlide].classList.add('active');

  // Update counter
  var counter = document.getElementById('slideCounter');
  if (counter) {
    counter.textContent = (currentSlide + 1) + ' / ' + slideEls.length;
  }
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    showSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    showSlide(currentSlide - 1);
  }
}

// =====================
// Scaling
// =====================

function scaleSlides() {
  var container = document.getElementById('slideContainer');
  var viewport = document.getElementById('slideViewport');
  if (!container || !viewport) return;

  var isRatio43 = container.classList.contains('ratio-4-3');
  var slideWidth = isRatio43 ? 1024 : 1280;
  var slideHeight = isRatio43 ? 768 : 720;

  var viewportWidth = viewport.clientWidth;
  var viewportHeight = viewport.clientHeight;

  var scaleX = (viewportWidth - 40) / slideWidth;
  var scaleY = (viewportHeight - 40) / slideHeight;
  var scale = Math.min(scaleX, scaleY);

  container.style.transform = 'scale(' + scale + ')';
}

// =====================
// Keyboard Navigation
// =====================

document.addEventListener('keydown', function (e) {
  // Don't intercept when find toolbar is focused
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
      showSlide(slides.length - 1);
      break;
  }
});

// Resize handler
window.addEventListener('resize', function () {
  scaleSlides();
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
