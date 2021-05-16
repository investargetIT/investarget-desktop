console.log('hello statistic');

const statisticQueryString = window.location.search;
const statisticUrlParams = new URLSearchParams(statisticQueryString);
// const dataroomId = urlParams.get('dataroomId');
const statisticFileId = statisticUrlParams.get('fileId');
console.log('file id', statisticFileId);
// const documentId = fileId;

const statisticBaseUrl = 'http://apitest.investarget.com';

function statisticGetUserInfo() {
  const userInfoStr = localStorage.getItem('user_info');
  try {
    return JSON.parse(userInfoStr);
  } catch(e) {
    return null;
  }
}

const readFileRequest = async (documentId) => {
  if (!statisticFileId) return;

  console.log('request begin to read file');
  return;

  const user = getUserInfo()
  if (!user) {
    throw new Error('user missing');
  }

  const source = parseInt(localStorage.getItem('source'), 10)
  if (!source) {
    throw new Error('data source missing');
  }

  const body = {
    file: parseInt(documentId),
    type: 0,
  };

  const reqDiscussion = await fetch(`${baseUrl}/dataroom/userRecord/`, {
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
  console.log('req read file', response);
  const { code } = response;
  if (code !== 1000) {
    if (response.errormsg) {
      alert(response.errormsg);
    } else {
      alert('未知错误');
    }
  }
}

readFileRequest(fileId);
