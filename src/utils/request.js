import fetch from 'dva/fetch';

const baseUrl = "http://192.168.1.201:8000"
//const baseUrl = "/api"

class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.toString = () => `name: ApiError, code: ${code}, message: ${message}`
  }
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function parseErrorMessage(data) {
  const { code, errormsg } = data
  if (code !== 1000) {
    throw new ApiError(code, errormsg)
  }
  return  data 
}

/**
 *  * Requests a URL, returning a promise.
 *   *
 *    * @param  {string} url       The URL we want to request
 *     * @param  {object} [options] The options we want to pass to "fetch"
 *      * @return {object}           An object containing either "data" or "err"
 *       */
export default async function request(url, options) {

  const response = await fetch(baseUrl + url, options);

  checkStatus(response);

  const data = await response.json();
  
  console.log(data)

  parseErrorMessage(data)

  return { data: data.result }

}
