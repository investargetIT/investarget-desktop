require('es6-promise').polyfill();
import fetch from 'dva/fetch';

const prodUrl = 'https://api.investarget.com';
let devUrl = "http://192.168.1.251:8080";
// devUrl = 'http://192.168.1.201:8000';
// devUrl = prodUrl;
const baseUrl = process.env.NODE_ENV === 'development' ? devUrl : prodUrl;
const mobileUploadUrl = process.env.NODE_ENV === 'development' ? 'http://192.168.1.113:3000' : 'https://m.investarget.com'; 
export { baseUrl, mobileUploadUrl, prodUrl }

export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
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
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default async function request(url, options) {

  const isThirdPartyServer = /^http/.test(url);

  const fullUrl = isThirdPartyServer ? url : baseUrl + url;

  const response = await fetch(fullUrl, options);

  checkStatus(response);

  const data = await response.json();

  console.log(fullUrl, data);

  if (isThirdPartyServer) return data;

  // Parse response with code 200 using our own rule is meaningless 
  // Only when request our own server should we parse response data
  parseErrorMessage(data);

  return { data: data.result };

}
