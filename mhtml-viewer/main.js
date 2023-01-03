function setContent(content, filePathURI) {
  // console.log('MHTML Content: '+content);
  const mhtparser = new mailparser.MailParser();
  mhtparser.on('end', mail_object => {
    // console.log('mail_object:', mail_object);

    const contLocation = /^content-location:(.*$)/im.exec(content);
    mail_object.contentLocation =
      contLocation && contLocation.length > 0 ? contLocation[1] : 'not found';
    cleanedHTML = DOMPurify.sanitize(mail_object.html);

    updateHTMLContent($('#mhtmlViewer'), cleanedHTML, filePathURI);

    $('#fileMeta').text('saved on ' + mail_object.headers.date);

    // View readability mode

    try {
      const documentClone = document.cloneNode(true);
      const article = new Readability(document.baseURI, documentClone).parse();
      readabilityContent = article.content;
    } catch (e) {
      console.log('Error handling' + e);
      const msg = {
        command: 'showAlertDialog',
        title: 'Readability Mode',
        message: 'This content can not be loaded.'
      };
      sendMessageToHost(msg);
    }

    if (readabilityContent) {
      updateHTMLContent($('#mhtmlViewer'), readabilityContent, filePathURI);
    }

    mhtmlViewer = document.getElementById('mhtmlViewer');
    mhtmlViewer.style.fontSize = fontSize;
    mhtmlViewer.style.fontFamily = 'Helvetica, Arial, sans-serif';
    mhtmlViewer.style.background = '#ffffff';
    mhtmlViewer.style.color = '';

    init(filePathURI, mail_object);
  });

  mhtparser.write(content);
  mhtparser.end();
}
