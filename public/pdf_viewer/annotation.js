const drawAnnotationLayer = function () {
  // finished rendering
  const { PDFAnnotate } = window;
  const { default: PDFJSAnnotate } = PDFAnnotate;

  const { UI } = PDFJSAnnotate;
  const VIEWER = document.getElementById('viewer');
  console.log('viewer', VIEWER);
  const RENDER_OPTIONS = {
    documentId: 'https://file.investarget.com/2020070115161593587812cwdjst.pdf?e=1599704596&token=NJkzgfMrIi-wL_gJyeLfU4dSqXyk5eeGrI7COPPu:CFl57E_QrTwl01u4VA7aN4ujkIM=',
    pdfDocument: null,
    scale: 1,
    rotate: 0
  };

  PDFJSAnnotate.setStoreAdapter(PDFJSAnnotate.LocalStoreAdapter)

  const viewport = {
    height: 1055.621,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    scale: 1.33,
    transform: [1.33, 0, 0, -1.33, 0, 1055.621],
    viewBox: [0, 0, 581.1, 793.7],
    width: 772.863,
  }
  VIEWER.appendChild(UI.createPage(1));
  PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());
  const adapter = PDFJSAnnotate.getStoreAdapter();
  adapter.getAnnotations('test.pdf', 1).then(annotations => {
    console.log('annotations', annotations);
    const svg = document.querySelector('.annotationLayer');
    svg.setAttribute('width', viewport.width);
    svg.setAttribute('height', viewport.height);
    PDFJSAnnotate.render(svg, viewport, annotations)
  })
}
window.drawAnnotationLayer = drawAnnotationLayer;
