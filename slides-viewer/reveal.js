function initReveal() {
  const scriptMDPlugin = document.createElement('script');
  scriptMDPlugin.onload = function() {
    const script = document.createElement('script');
    //  script.setAttribute('type', 'module');
    script.onload = function() {
      Reveal.initialize({
        controls: true,
        progress: true,
        center: true,
        hash: true,
        plugins: [
          // RevealZoom,
          // RevealNotes,
          // RevealSearch,
          RevealMarkdown
          // RevealHighlight
        ]
      });
    };
    script.src = 'libs/reveal.js/reveal.js';
    document.head.appendChild(script);
  };
  scriptMDPlugin.src = 'libs/reveal.js/plugin/markdown/markdown.js';
  document.head.appendChild(scriptMDPlugin);
}
