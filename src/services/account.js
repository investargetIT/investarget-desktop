import request from '../utils/request';

export function login(values) {

  console.log('YXM account service', values)
    const param = {
      mobileOrEmailAddress: values.username,
      password: values.password,
      app: 3
    }
  return request('https://api.investarget.com/api/account', {
    method: 'POST',
    body: JSON.stringify(param),
    headers: {
	    "Content-Type": "application/json",
	  },
  }); 
}

