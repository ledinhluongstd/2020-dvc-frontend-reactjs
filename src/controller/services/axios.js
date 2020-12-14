import axios from 'axios'

function Axios(method, url, data, config) {
  return axios({
    method: method,
    url: url,
    data: data,
    config: config
  }).then(res => {
    if (method.toUpperCase() === 'DELETE' || method.toUpperCase() === 'LOCK' || method.toUpperCase() === 'PATCH') {
      if (res.status === 200 || res.status === 204) {
        return true;
      }
      else {
        return false
      }
    } else {
      if (res.data) {
        return res.data;
      }
      else {
        return false
      }
    }
  })
    .catch(error => {
      if (__DEV__) console.log(error)
      return null
    });
};

export { Axios }