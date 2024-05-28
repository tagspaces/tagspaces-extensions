## Updating the PDF.js library for the TagSpaces PDF-viewer

### Clone pdf.js not pdf-dist

    git clone https://github.com/mozilla/pdf.js.git

### Install dependencies

    npm install --force

    npm install -g gulp-cli

### Patch PDF.js prior version 3

Patch viewer.js by removing the following lines to allow opening PDFs on TagSpaces with S3 location.

https://github.com/mozilla/pdf.js/issues/7153

    if (origin !== viewerOrigin && protocol !== "blob:") {
      throw new Error("file origin does not match viewer's");
    }

### Patch PDF.js version 3 and later

Commenting lines 2105 +3 in app.js

    // Removing of the following line will not guarantee that the viewer will
    // start accepting URLs from foreign origin -- CORS headers on the remote
    // server must be properly configured.
    if (fileOrigin !== viewerOrigin) {
      throw new Error("file origin does not match viewer's");
    }

### Build

    gulp generic-legacy

### Update the files for the extensions

copy build/generic-legacy pdf-viewer/generic

### Latest integrated version

v4.2.67 - 20240528

v3.8.162 - 20230719

v3.2.146
