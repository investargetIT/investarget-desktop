const { default: PDFJSAnnotate } = PDFAnnotate;

const { UI, config: { annotationLayerName } } = PDFJSAnnotate;
// UI.enableRect('highlight');
// UI.enableRect('area');
UI.enableEdit();

const drawAnnotationLayer = function (page) {
  const { source, pageNumber } = page;
  const { viewport } = source;

  const pageHtml = document.querySelector(`.page[data-page-number="${pageNumber}"]`);
  const svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgLayer.setAttribute('class', `${annotationLayerName} custom-annotation-layer`);
  pageHtml.insertBefore(svgLayer, pageHtml.children[1]);
  
  PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());
  const adapter = PDFJSAnnotate.getStoreAdapter();
  adapter.getAnnotations('test.pdf', pageNumber ).then(annotations => {
    const svg = document.querySelector(`.page[data-page-number="${pageNumber}"] .custom-annotation-layer`);
    svg.setAttribute('width', viewport.width);
    svg.setAttribute('height', viewport.height);
    PDFJSAnnotate.render(svg, viewport, annotations);
  });
}

window.drawAnnotationLayer = drawAnnotationLayer;

$('.icon-container').click(function() {
  $(this).toggleClass('toggled');
});
