/* Canvas Viewer for TagSpaces - using json-canvas-viewer */

const filePath = getParameterByName('file');
const locale = getParameterByName('locale') || 'en';

let viewer = null;
let currentTheme = 'light';

// =====================
// Rendering
// =====================

function renderCanvas(content) {
  let canvasData;
  try {
    canvasData = JSON.parse(content);
  } catch (e) {
    console.error('[Canvas Viewer] Failed to parse JSON:', e);
    const container = document.getElementById('canvasContainer');
    container.textContent = 'Error: Invalid JSON Canvas file.';
    return;
  }

  const containerEl = document.getElementById('canvasContainer');

  // Dispose previous viewer if any
  if (viewer) {
    try {
      viewer.dispose();
    } catch (e) {
      // ignore
    }
    containerEl.innerHTML = '';
  }

  // Use theme from TagSpaces URL parameter (set by common.js)
  currentTheme = theme === 'dark' ? 'dark' : 'light';

  // Initialize the viewer
  viewer = new JSONCanvasViewer(
    {
      container: containerEl,
      canvas: canvasData,
      theme: currentTheme,
      loading: 'normal',
      parser: canvasParser,
    },
    [CanvasControls, CanvasMinimap],
  );

  viewer.load();

  // Override fullscreen toggle since extensions run inside an iframe
  // and requestFullscreen is blocked without the allowfullscreen attribute.
  if (viewer.onToggleFullscreen) {
    viewer.onToggleFullscreen.subscribe(() => {
      const el = document.getElementById('canvasContainer');
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(() => {
          // Fallback: simulate fullscreen with CSS
          el.classList.toggle('pseudo-fullscreen');
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  // Update info
  const nodeCount = canvasData.nodes ? canvasData.nodes.length : 0;
  const edgeCount = canvasData.edges ? canvasData.edges.length : 0;
  const infoEl = document.getElementById('canvasInfo');
  if (infoEl) {
    infoEl.textContent = nodeCount + ' nodes, ' + edgeCount + ' edges';
  }
}

// =====================
// Theme Toggle
// =====================

function toggleTheme() {
  if (!viewer) return;
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  viewer.changeTheme(currentTheme);
}

// =====================
// Keyboard Shortcuts
// =====================

document.addEventListener('keydown', (e) => {
  if (
    e.target.tagName === 'INPUT' ||
    e.target.tagName === 'TEXTAREA' ||
    e.target.isContentEditable
  ) {
    return;
  }

  // Ctrl/Cmd + 0: Reset zoom
  if ((e.ctrlKey || e.metaKey) && e.key === '0') {
    e.preventDefault();
    if (viewer && viewer.resetView) {
      viewer.resetView();
    }
  }
});

// =====================
// TagSpaces Integration
// =====================

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    insertAboutDialog('https://docs.tagspaces.org/extensions/canvas-viewer');
    insertLoadingAnimation();
    insertPrintMenuItem();

    // Insert theme toggle menu item
    const themeMenuItem = document.getElementById('toggleThemeMenuItemPlaceholder');
    if (themeMenuItem) {
      themeMenuItem.innerHTML =
        '<a id="toggleThemeMenuItem" class="dropdown-item" href="#">' +
        '<svg width="24" height="24" class="bi"><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"></path></svg>' +
        '<span data-i18n="changeTheme">Toggle Theme</span>' +
        '</a>';
      document
        .getElementById('toggleThemeMenuItem')
        .addEventListener('click', (e) => {
          e.preventDefault();
          toggleTheme();
        });
    }

    initI18N(locale, 'ns.extension.json');
    sendMessageToHost({ command: 'loadDefaultTextContent' });
  }
});

// Called by TagSpaces to set the file content
function setContent(content, fileDirectory) {
  const UTF8_BOM = '\uFEFF';
  if (content.indexOf(UTF8_BOM) === 0) {
    content = content.substring(1);
  }

  renderCanvas(content);

  hideLoadingAnimation();
}
