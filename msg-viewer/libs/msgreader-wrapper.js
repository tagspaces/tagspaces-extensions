import * as MsgLib from '@kenjiuno/msgreader';
import { Buffer } from 'buffer';

// 1. Set Buffer globally (The library fails without this)
window.Buffer = Buffer;

// 2. Find the actual constructor
let Constructor = null;

if (typeof MsgLib.MSGReader === 'function') {
    // It's a named export (Most likely)
    Constructor = MsgLib.MSGReader;
} else if (MsgLib.default && typeof MsgLib.default.MSGReader === 'function') {
    // It's inside the default export
    Constructor = MsgLib.default.MSGReader;
} else if (typeof MsgLib.default === 'function') {
    // The default export is the class itself
    Constructor = MsgLib.default;
} else {
    // Fallback to the whole library object
    Constructor = MsgLib;
}

// 3. Assign it to the window
window.MSGReader = Constructor;

// 4. Debug check (You can remove this after it works)
console.log("MSGReader Loaded. Type of window.MSGReader is:", typeof window.MSGReader);