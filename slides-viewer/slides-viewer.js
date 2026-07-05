const filePath = getParameterByName('file');
const locale = getParameterByName('locale') || 'en';

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    insertAboutDialog('https://docs.tagspaces.org/extensions/slides-viewer');
    insertLoadingAnimation();

    initI18N(locale, 'ns.extension.json');

    sendMessageToHost({ command: 'loadDefaultTextContent' });

    documentContent = document.getElementById('documentContent');

    // Handling settings
    let extSettings = loadExtSettings('slidesViewerSettings');

    function saveSettings() {
      saveExtSettings('slidesViewerSettings', { styleIndex, zoomLevel });
    }

    let zoomLevel = 100;
    if (extSettings && extSettings.zoomLevel) {
      if (extSettings.zoomLevel >= 30 && extSettings.zoomLevel <= 500) {
        zoomLevel = extSettings.zoomLevel;
      }
      documentContent.style.zoom = zoomLevel + '%';
    }

    let styleIndex = 0;

    saveSettings();
  }
});

function setContent(content, fileDirectory) {
  const bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m; // jshint ignore:line
  let bodyContent;

  try {
    bodyContent = content.match(bodyRegex)[1];
  } catch (e) {
    console.log('Error parsing the body of the HTML document. ' + e);
    bodyContent = content;
  }

  // removing all scripts from the document
  const cleanedBodyContent = bodyContent.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '',
  );

  document.body.innerHTML = DOMPurify.sanitize(cleanedBodyContent);
  document.body.querySelectorAll('style').forEach((styleEl) => {
    styleEl.textContent = sanitizeCss(styleEl.textContent);
  });

  Reveal.initialize({
    controls: true,
    progress: true,
    center: true,
    hash: true,
    // The RevealMarkdown plugin re-renders `data-markdown` slides with `marked`,
    // whose raw-HTML passthrough (sanitize disabled) bypasses the DOMPurify pass
    // above and would let a slide's inline `<img onerror>`/`<iframe>` execute.
    // Route marked's HTML tokens through DOMPurify so injected markup/handlers
    // are stripped while legitimate inline HTML is preserved.
    markdown: {
      sanitize: true,
      sanitizer: (html) => DOMPurify.sanitize(html),
    },
    plugins: [
      // RevealZoom,
      RevealNotes,
      // RevealSearch,
      RevealMarkdown,
      RevealHighlight,
    ],
  });

  hideLoadingAnimation();

  document.getElementById('readabilityOffLabel').style.display = 'none';

  handleLinks(document.documentElement, fileDirectory);

  fixingEmbeddingOfLocalImages(document.body, fileDirectory);
}
