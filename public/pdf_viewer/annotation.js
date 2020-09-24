const { default: PDFJSAnnotate } = PDFAnnotate;
const { UI, config: { annotationLayerName } } = PDFJSAnnotate;

const documentId = 'test.pdf';

const loadAllComments = function () {
  const generateSingleComment = function (content, page) {
    return `<div class="comment-container">
      <div>${content}</div>
      <div class="comment-page">Page ${page}</div>
    </div>`
  };
  const commentsView = document.getElementById('commentsView');
  const annotationStr = localStorage.getItem(`${documentId}/annotations`);
  const allAnnotations = JSON.parse(annotationStr);
  let comments = [];
  if (allAnnotations) {
    comments = allAnnotations.filter(f => f.class === 'Comment');
    comments = comments.map(m => {
      const annotation = allAnnotations.filter(f => f.uuid === m.annotation);
      if (annotation.length > 0) {
        return { ...m, page: annotation[0].page };
      } else {
        return { ...m, page: 'error'};
      }
    });
  }
  const commentsOnThisPage = comments.reduce((previous, current) => previous.concat(current), []);
  const commentsHTML = commentsOnThisPage.map(m => generateSingleComment(m.content, m.page)).reduce((previous, current) => previous + current, '');
  commentsView.innerHTML = commentsHTML;
}
loadAllComments();

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
function enablePoint() {
  $('#annotation-comment').addClass('toggled');
  UI.enablePoint();
}
function disablePoint() {
  $('#annotation-comment').removeClass('toggled');
  UI.disablePoint();
}

$('#annotation-select').click(function() {
  disableRectangle();
  disableHighlight();
  disablePoint();
  if ($('#annotation-select').hasClass('toggled')) {
    disableEdit();
  } else {
    enableEdit();
  }
});

$('#annotation-rectangle').click(function() {
  disableEdit();
  disableHighlight();
  disablePoint();
  if ($('#annotation-rectangle').hasClass('toggled')) {
    disableRectangle();
  } else {
    enableRectangle();
  }
});

$('#annotation-highlight').click(function() {
  disableEdit();
  disableRectangle();
  disablePoint();
  if ($('#annotation-highlight').hasClass('toggled')) {
    disableHighlight();
  } else {
    enableHighlight();
  }
});

$('#annotation-comment').click(function() {
  disableEdit();
  disableRectangle();
  disableHighlight();
  if ($('#annotation-comment').hasClass('toggled')) {
    $('#annotation-comment').removeClass('toggled');
  } else {
    $('#annotation-comment').addClass('toggled');
  }
});
$('#annotation-comment').hover(function() {
  if ($('#annotation-comment').hasClass('toggled')) {
    UI.disablePoint();
  }
}, function() {
  if ($('#annotation-comment').hasClass('toggled')) {
    UI.enablePoint();
  }
});
$('#annotation-rectangle').hover(function() {
  if ($('#annotation-comment').hasClass('toggled')) {
    UI.disablePoint();
  }
}, function() {
  if ($('#annotation-comment').hasClass('toggled')) {
    UI.enablePoint();
  }
});

UI.addEventListener('annotation:add', (documentId, pageNumber, annotation) => {
  console.log('Annotation added', documentId, pageNumber, annotation);
  // TODO: remove highlight annotation if it's just a click
  $('#add-comment-form').data('annotation', { documentId, annotationId: annotation.uuid });
  $('#add-comment-form').modal();
});

// 提交评论
$('#comment-submit-button').click(function(e) {
  e.preventDefault();
  const content = $('#comment-content').val();
  if (!content) return;
  const annotation = $('#add-comment-form').data('annotation');
  const { documentId, annotationId } = annotation;
  PDFJSAnnotate.getStoreAdapter().addComment(documentId, annotationId, content).then(comment => {
    $('#add-comment-form').removeData('annotation');
    $.modal.close();
    $('#comment-content').val('');
    loadAllComments();
  });
});
