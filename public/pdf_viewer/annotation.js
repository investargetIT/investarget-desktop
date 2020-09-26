const { default: PDFJSAnnotate } = PDFAnnotate;
const { UI, config: { annotationLayerName } } = PDFJSAnnotate;

const documentId = 'test.pdf';

let submitComment = false;
let isReply = false;

const loadAllComments = function () {
  const generateSingleComment = function (annotation) {
    const { uuid: annotationId, page, comments } = annotation;
    const commentHTML = comments.map(m => `<div class="comment-content">${m.content}</div>`).reduce((prev, curr) => prev + curr, '');
    return `<div class="comment-container" data-annotation-uuid="${annotationId}">
      <div class="comment-page">Page ${page}</div>  
      ${commentHTML} 
      <div class="comment-actions">
        <img class="comment-actions__icon comment-actions__reply" src="/pdf_viewer/images/annotationBarButton-reply.png" />
        <img class="comment-actions__icon comment-actions__delete" src="/pdf_viewer/images/annotationBarButton-delete.png" />
      </div>
    </div>`
  };
  const commentsView = document.getElementById('commentsView');
  const annotationStr = localStorage.getItem(`${documentId}/annotations`);
  const allAnnotations = JSON.parse(annotationStr);
  let annotationComments = [];
  if (allAnnotations) {
    annotationComments = allAnnotations.filter(f => f.class === 'Annotation');
    annotationComments = annotationComments.map(m => {
      const comments = allAnnotations.filter(f => f.class === 'Comment' && f.annotation === m.uuid);
      return { ...m, comments };
    });
  }
  console.log('annotation comments', annotationComments);
  const commentsHTML = annotationComments.filter(f => f.comments.length > 0)
    .map(m => generateSingleComment(m))
    .reduce((previous, current) => previous + current, '');
  commentsView.innerHTML = commentsHTML;

  $('.comment-container').click(function() {
    $('.comment-container').removeClass('active');
    $(this).addClass('active');
    // Highligh related annotation
    const annotationId = $(this).attr('data-annotation-uuid');
    const target = document.querySelector(`[data-pdf-annotate-uuid="${annotationId}"]`);
    if (target) {
      UI.createEditOverlay(target);
    }
  });
  $('.comment-actions__reply').click(function() {
    console.log('comment actions reply click', $(this));
    const annotationId = $(this).parents('.comment-container').attr('data-annotation-uuid');
    $('#add-comment-form').data('annotation', { documentId, annotationId });
    isReply = true;
    $('#add-comment-form').modal();
    return false;
  });
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
  if (annotation.type === 'point') {
    setTimeout(() => {
      loadAllComments()
    }, 1000);
    return;
  }
  $('#add-comment-form').data('annotation', { documentId, annotationId: annotation.uuid });
  $('#add-comment-form').modal();
});

// 提交评论
$('#comment-submit-button').click(function(e) {
  e.preventDefault();
  const content = $('#comment-content').val();
  if (!content) {
    alert('评论内容不能为空');
    return
  };
  const annotation = $('#add-comment-form').data('annotation');
  const { documentId, annotationId } = annotation;
  PDFJSAnnotate.getStoreAdapter().addComment(documentId, annotationId, content).then(comment => {
    $('#add-comment-form').removeData('annotation');
    submitComment = true;
    $.modal.close();
    $('#comment-content').val('');
    loadAllComments();
  });
});

$('#add-comment-form').on($.modal.BEFORE_CLOSE, function(event, modal) {
  console.log('event', event);
  console.log('modal', modal);
  if (!submitComment && !isReply) {
    $('#comment-content').val('');
    const annotation = $('#add-comment-form').data('annotation');
    const { documentId, annotationId } = annotation;
    PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, annotationId).then(() => {
      $('#add-comment-form').removeData('annotation');

      const { currentPageNumber: pageNumber, _pages } = PDFViewerApplication.pdfViewer;
      const { viewport } = _pages[pageNumber - 1];

      $(`.page[data-page-number="${pageNumber}"] .custom-annotation-layer`).remove();

      // TODO: refactor codes below along with drawAnnotationLayer
      const pageHtml = document.querySelector(`.page[data-page-number="${pageNumber}"]`);
      const svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgLayer.setAttribute('class', `${annotationLayerName} custom-annotation-layer`);
      pageHtml.insertBefore(svgLayer, pageHtml.children[1]);
      PDFJSAnnotate.getStoreAdapter().getAnnotations(documentId, pageNumber).then(annotations => {
        const svg = document.querySelector(`.page[data-page-number="${pageNumber}"] .custom-annotation-layer`);
        svg.setAttribute('width', viewport.width);
        svg.setAttribute('height', viewport.height);
        PDFJSAnnotate.render(svg, viewport, annotations);
      });
    });
  };
});

$('#add-comment-form').on($.modal.AFTER_CLOSE, function() {
  isReply = false;
  submitComment = false;
});
