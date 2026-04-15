/**
 * Sample JavaScript file for testing the Text Editor extension.
 * Demonstrates various JS language features.
 */

// Constants and configuration
const API_URL = 'https://api.example.com/v1';
const MAX_RETRIES = 3;

// Class definition
class FileManager {
  #files = new Map();

  constructor(basePath) {
    this.basePath = basePath;
    this.createdAt = new Date();
  }

  addFile(name, content) {
    const file = {
      name,
      content,
      size: content.length,
      modified: new Date(),
      tags: [],
    };
    this.#files.set(name, file);
    return file;
  }

  getFile(name) {
    return this.#files.get(name) ?? null;
  }

  listFiles(filter = null) {
    const files = [...this.#files.values()];
    return filter ? files.filter(filter) : files;
  }

  get fileCount() {
    return this.#files.size;
  }
}

// Arrow functions and async/await
const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error.message);
    return null;
  }
};

// Destructuring and template literals
const formatFile = ({ name, size, tags }) => {
  const sizeKB = (size / 1024).toFixed(2);
  const tagList = tags.length > 0 ? tags.join(', ') : 'none';
  return `${name} (${sizeKB} KB) [tags: ${tagList}]`;
};

// Array methods and functional patterns
const processFiles = (files) =>
  files
    .filter((f) => f.size > 0)
    .map((f) => ({ ...f, name: f.name.toLowerCase() }))
    .sort((a, b) => b.modified - a.modified);

// Example usage
const manager = new FileManager('/documents');
manager.addFile('readme.md', '# Hello World\n\nThis is a test file.');
manager.addFile('config.json', '{"key": "value"}');

console.log(`Total files: ${manager.fileCount}`);
console.log(manager.listFiles().map(formatFile));

export { FileManager, fetchData, processFiles };
