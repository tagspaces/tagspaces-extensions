Patch viewer.js by removing the following lines to allow opening PDFs on TagSpaces with S3 location.

https://github.com/mozilla/pdf.js/issues/7153

if (origin !== viewerOrigin && protocol !== "blob:") {
  throw new Error("file origin does not match viewer's");
}
