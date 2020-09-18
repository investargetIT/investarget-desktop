const { default: PDFJSAnnotate } = PDFAnnotate;

const { UI, config: { annotationLayerName } } = PDFJSAnnotate;

const documentId = 'test.pdf';
const drawAnnotationLayer = function (page) {
  const { source, pageNumber } = page;
  const { viewport } = source;

  const pageHtml = document.querySelector(`.page[data-page-number="${pageNumber}"]`);
  const svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgLayer.setAttribute('class', `${annotationLayerName} custom-annotation-layer`);
  pageHtml.insertBefore(svgLayer, pageHtml.children[1]);
  
  PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());
  const adapter = PDFJSAnnotate.getStoreAdapter();
  adapter.getAnnotations(documentId, pageNumber ).then(annotations => {
    const svg = document.querySelector(`.page[data-page-number="${pageNumber}"] .custom-annotation-layer`);
    svg.setAttribute('width', viewport.width);
    svg.setAttribute('height', viewport.height);
    PDFJSAnnotate.render(svg, viewport, annotations);
    Promise.all(annotations.annotations.map(m => adapter.getComments(documentId, m.uuid))).then(comments => {
      const commentsOnThisPage = comments.reduce((previous, current) => previous.concat(current), []);
      console.log('comments on this page', commentsOnThisPage);
    });
  });
}

window.drawAnnotationLayer = drawAnnotationLayer;

function enableEdit() {
  $('#annotation-select').addClass('toggled');
  $('.custom-annotation-layer').css('zIndex', 1);
  UI.enableEdit();
}
function disableEdit() {
  $('#annotation-select').removeClass('toggled');
  $('.custom-annotation-layer').css('zIndex', 0);
  UI.disableEdit();
}
function enableRectangle() {
  $('#annotation-rectangle').addClass('toggled');
  UI.enableRect('area');
}
function disableRectangle() {
  $('#annotation-rectangle').removeClass('toggled');
  UI.disableRect();
}
function enableHighlight() {
  $('#annotation-highlight').addClass('toggled');
  UI.enableRect('highlight');
}
function disableHighlight() {
  $('#annotation-highlight').removeClass('toggled');
  UI.disableRect();
}

$('#annotation-select').click(function() {
  disableRectangle();
  disableHighlight();
  if ($('#annotation-select').hasClass('toggled')) {
    disableEdit();
  } else {
    enableEdit();
  }
});

$('#annotation-rectangle').click(function() {
  disableEdit();
  disableHighlight();
  if ($('#annotation-rectangle').hasClass('toggled')) {
    disableRectangle();
  } else {
    enableRectangle();
  }
});

$('#annotation-highlight').click(function() {
  disableEdit();
  disableRectangle();
  if ($('#annotation-highlight').hasClass('toggled')) {
    disableHighlight();
  } else {
    enableHighlight();
  }
});
