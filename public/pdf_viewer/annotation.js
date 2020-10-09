const { default: PDFJSAnnotate } = PDFAnnotate;
const { UI, config: { annotationLayerName } } = PDFJSAnnotate;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const dataroomId = urlParams.get('dataroomId');
const fileId = urlParams.get('fileId');

const documentId = fileId;

const baseUrl = 'http://apitest.investarget.com';

let submitComment = false;
let isReply = false;

// TODO: get all annotations adding page_size
const getAnnotationsReq = async (documentId) => {
  const user = getUserInfo()
  if (!user) {
    throw new Error('user missing');
  }

  const source = parseInt(localStorage.getItem('source'), 10)
  if (!source) {
    throw new Error('data source missing');
  }

  const reqDiscussion = await fetch(`${baseUrl}/dataroom/discuss/?file=${documentId}&page_size=1`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'clienttype': '3',
      'source': source,
      'token': user.token,
    },
  });
  const response = await reqDiscussion.json();
  const { code } = response;
  if (code !== 1000) {
    if (response.errormsg) {
      alert(response.errormsg);
    } else {
      alert('未知错误');
    }
    return;
  }
  const { result: { count, data } } = response;
  if (count <= 1) {
    return data;
  }
  const reqDiscussion2 = await fetch(`${baseUrl}/dataroom/discuss/?file=${documentId}&page_size=${count}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'clienttype': '3',
      'source': source,
      'token': user.token,
    },
  });
  const response2 = await reqDiscussion2.json();
  return response2.result.data;
}

const saveAnnotationsToLocalStorage = async (documentId) => {
  const data = await getAnnotationsReq(documentId);
  const annotations = data.map(m => {
    const annotation = JSON.parse(m.location);
    return { ...annotation, systemId: m.id };
  });
  localStorage.setItem(`${documentId}/annotations`, JSON.stringify(annotations));
}

saveAnnotationsToLocalStorage(documentId);

const myStoreAdapter = new PDFJSAnnotate.StoreAdapter({
  getAnnotations(documentId, pageNumber) {
    return getAnnotationsForAdapter(documentId, pageNumber);
  },
  addAnnotation(documentId, pageNumber, annotation) {
    return addAnnotationReq(documentId, pageNumber, annotation);
  },
  getComments() {
    return new Promise((resolve) => {
      return resolve([]);
    });
  },
  // getAnnotation(documentId, annotationId) {/* ... */},

  // editAnnotation(documentId, pageNumber, annotation) {/* ... */},

  // deleteAnnotation(documentId, annotationId) {/* ... */},
  
  // addComment(documentId, annotationId, content) {/* ... */},

  // deleteComment(documentId, commentId) {/* ... */}
});

// PDFJSAnnotate.setStoreAdapter(myStoreAdapter);
PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());

const loadAllComments = async function () {
  const generateSingleComment = function (annotation) {
    const {
      uuid: annotationId,
      page,
      question,
      user,
      asktime,
      id: systemId,
      answer,
      answertime,
      trader,
    } = annotation;
    let answerHTML = '';
    if (answer && answertime && trader) {
      answerHTML = `<div class="comment-wrapper">
        <img class="comment-author-avatar" src="${trader.photourl}" />
        <div class="comment-right">
          <div class="comment-time">回复于 ${answertime.slice(0, 16).replace('T', ' ')}</div>
          <div class="comment-author-name">${trader.username}</div>
          <div class="comment-content">${answer}</div>
        </div>
      </div>`;
    }
    return `<div class="comment-container" data-annotation-uuid="${annotationId}" data-annotation-system-id="${systemId}">
      <div class="comment-page">Page ${page}</div>
      <div class="comment-wrapper">
        <img class="comment-author-avatar" src="${user.photourl}" />
        <div class="comment-right">
          <div class="comment-time">提问于 ${asktime.slice(0, 16).replace('T', ' ')}</div>
          <div class="comment-author-name">${user.username}</div>
          <div class="comment-content">${question}</div>
        </div>
      </div>
      ${answerHTML} 
      <div class="comment-actions">
        <img class="comment-actions__icon comment-actions__reply" src="/pdf_viewer/images/annotationBarButton-reply.png" />
        <img class="comment-actions__icon comment-actions__delete" src="/pdf_viewer/images/annotationBarButton-delete.png" />
      </div>
    </div>`
  };
  const commentsView = document.getElementById('commentsView');
  // const annotationStr = localStorage.getItem(`${documentId}/annotations`);
  // const allAnnotations = JSON.parse(annotationStr);
  const allAnnotations = await getAnnotationsReq(documentId);
  console.log('all annotations', allAnnotations);
  let annotationComments = [];
  if (allAnnotations) {
    // annotationComments = allAnnotations.filter(f => f.class === 'Annotation');
    annotationComments = allAnnotations.filter(f => f.location).map(m => {
      const { location } = m;
      const annotation = JSON.parse(location);
      const { page, uuid } = annotation;
      return { ...m, page, uuid };
    });
    // annotationComments = annotationComments.map(m => {
    //   const comments = allAnnotations.filter(f => f.class === 'Comment' && f.annotation === m.uuid);
    //   return { ...m, comments };
    // });
  }
  console.log('annotation comments', annotationComments);
  const commentsHTML = annotationComments.filter(f => f.question && f.page)
    .map(m => generateSingleComment(m))
    .reduce((previous, current) => previous + current, '');
  if (commentsHTML) {
    setTimeout(() => {
      window.PDFViewerApplication.pdfSidebar.open();
      window.PDFViewerApplication.pdfSidebar.switchView(4);
    }, 1000);
  }
  commentsView.innerHTML = commentsHTML;

  $('.comment-container').click(function() {

    disableRectangle();
    disablePoint();

    $('.comment-container').removeClass('active');
    $(this).addClass('active');
    // Highligh related annotation
    const annotationId = $(this).attr('data-annotation-uuid');
    const target = document.querySelector(`[data-pdf-annotate-uuid="${annotationId}"]`);
    if (target) {
      UI.createEditOverlay(target);
    }
  });

  // 回复评论
  $('.comment-actions__reply').click(function() {
    UI.disableEdit();
    // disable point here otherwise you can't focus when replay a comment
    disablePoint();

    const annotationId = $(this).parents('.comment-container').attr('data-annotation-system-id');
    $('#add-comment-form').data('replyAnnotation', { documentId, annotationId });
    isReply = true;
    $('#add-comment-form').modal();
    return false;
  });
  
  // 删除评论
  $('.comment-actions__delete').click(function() {
    if (!window.confirm('你确定要删除这些评论吗？相关的批注也会被一并删除')) return false;
    
    // You need to remove the edit overlay otherwise it still exists even if related annotation is removed
    // You can simply call disableEdit to do that
    UI.disableEdit();

    const annotationId = $(this).parents('.comment-container').attr('data-annotation-uuid');
    const systemId = $(this).parents('.comment-container').attr('data-annotation-system-id');

    deleteAnnotationReq(systemId).then(res => {
      loadAllComments();
      PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, annotationId).then(() => {
        // TODO: refactor codes below
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
    });
    // After that delete the annotation
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
  
  PDFJSAnnotate.getStoreAdapter().getAnnotations(documentId, pageNumber ).then(annotations => {
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
  $('#add-comment-form').data('formAnnotation', { documentId, pageNumber, annotation });
  $('#add-comment-form').modal();
});

UI.addEventListener('annotation:delete', (documentId, annotationId) => {
  const annotationStr = localStorage.getItem(`${documentId}/annotations`);
  const allAnnotations = JSON.parse(annotationStr);
  const relatedComments = allAnnotations.filter(f => f.class === 'Comment' && f.annotation === annotationId);
  Promise.all(relatedComments.map(m => PDFJSAnnotate.getStoreAdapter().deleteComment(documentId, m.uuid))).then(() => {
    loadAllComments();
  });
});

// 提交评论或者回复
$('#comment-submit-button').click(function(e) {
  e.preventDefault();
  const content = $('#comment-content').val();
  if (!content) {
    alert('评论内容不能为空');
    return
  };
  if (isReply) {
    const replyData = $('#add-comment-form').data('replyAnnotation');
    const { documentId, annotationId } = replyData;
    console.log('docu id', documentId);
    console.log('annotation id', annotationId);
    addAnnotationCommentReq(annotationId, content).then(() => {
      $('#add-comment-form').removeData('replyAnnotation');
      submitComment = true;
      $.modal.close();
      $('#comment-content').val('');
      loadAllComments();
    });
  } else {
    const formAnnotation = $('#add-comment-form').data('formAnnotation');
    const { documentId, pageNumber, annotation } = formAnnotation;
    addAnnotationReq(documentId, pageNumber, annotation, content).then(() => {
      $('#add-comment-form').removeData('formAnnotation');
      submitComment = true;
      $.modal.close();
      $('#comment-content').val('');
      loadAllComments();
      saveAnnotationsToLocalStorage(documentId);
    });
  }
});

$('#add-comment-form').on($.modal.BEFORE_CLOSE, function(event, modal) {
  console.log('event', event);
  console.log('modal', modal);
  if (!submitComment && !isReply) {
    $('#comment-content').val('');
    const formAnnotation = $('#add-comment-form').data('formAnnotation');
    const { documentId, annotation: { uuid: annotationId } } = formAnnotation;
    PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, annotationId).then(() => {
      $('#add-comment-form').removeData('formAnnotation');

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

function getUserInfo() {
  const userInfoStr = localStorage.getItem('user_info')
  try {
    return JSON.parse(userInfoStr)
  } catch(e) {
    return null
  }
}

const getAnnotationsForAdapter = async (documentId, pageNumber) => {
  const data = await getAnnotationsReq(documentId);
  const annotations = data.map(m => JSON.parse(m.location)).filter(f => f.page === pageNumber);
  return { annotations, documentId, pageNumber };
}

const addAnnotationReq = async (documentId, pageNumber, annotation, comment) => {
  console.log('document id', documentId);
  console.log('page number', pageNumber);
  console.log('annotation', annotation);

  const user = getUserInfo()
  if (!user) {
    throw new Error('user missing');
  }

  const source = parseInt(localStorage.getItem('source'), 10)
  if (!source) {
    throw new Error('data source missing');
  };

  const body = {
    user: user.id,
    dataroom: dataroomId,
    file: documentId,
    question: comment,
    location: JSON.stringify(annotation),
  };

  const reqDiscussion = await fetch(`${baseUrl}/dataroom/discuss/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'clienttype': '3',
      'source': source,
      'token': user.token,
    },
    body: JSON.stringify(body),
  });
  const response = await reqDiscussion.json();
  console.log('req discussion', response);
  const { code } = response;
  if (code !== 1000) {
    if (response.errormsg) {
      alert(response.errormsg);
    } else {
      alert('未知错误');
    }
  }
}

const addAnnotationCommentReq = async (annotationId, comment) => {
  console.log('annotation id', annotationId);

  const user = getUserInfo()
  if (!user) {
    throw new Error('user missing');
  }

  const source = parseInt(localStorage.getItem('source'), 10)
  if (!source) {
    throw new Error('data source missing');
  };

  const body = {
    answer: comment,
  };

  const reqDiscussion = await fetch(`${baseUrl}/dataroom/discuss/${annotationId}/`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'clienttype': '3',
      'source': source,
      'token': user.token,
    },
    body: JSON.stringify(body),
  });
  const response = await reqDiscussion.json();
  console.log('req discussion', response);
  const { code } = response;
  if (code !== 1000) {
    if (response.errormsg) {
      alert(response.errormsg);
    } else {
      alert('未知错误');
    }
  } else {
    return response;
  }
}

const deleteAnnotationReq = async id => {
  const user = getUserInfo()
  if (!user) {
    throw new Error('user missing');
  }

  const source = parseInt(localStorage.getItem('source'), 10)
  if (!source) {
    throw new Error('data source missing');
  };

  const reqDiscussion = await fetch(`${baseUrl}/dataroom/discuss/${id}/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'clienttype': '3',
      'source': source,
      'token': user.token,
    },
  });
  const response = await reqDiscussion.json();
  console.log('req discussion', response);
  const { code } = response;
  if (code !== 1000) {
    if (response.errormsg) {
      alert(response.errormsg);
    } else {
      alert('未知错误');
    }
  } else {
    return response;
  }
}

const testAnnotation = {
  class: "Annotation",
  height: 52.2,
  page: 1,
  type: "area",
  uuid: "d76646cb-d364-46d8-9983-56a4c88fd3b5",
  width: 87.00000000000003,
  x: 84.04545454545455,
  y: 36.13636363636365,
};

// getAnnotations(documentId, 1);

// addAnnotation(documentId, 1, testAnnotation);
