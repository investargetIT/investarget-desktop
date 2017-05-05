import request from '../utils/request';

export function login(values) {

  console.log('YXM account service', values)
  const param = {
    account: values.username,
    password: values.password,
    datasource: 1
  }
  return request('/user/login/', {
    method: 'POST',
    body: JSON.stringify(param),
    headers: {
      "Content-Type": "application/json",
      "clienttype": "3"
    },
  }); 
}

