import axios from 'axios'
import { setCookie } from './cookieFunction';
import { fetchToastNotify, fetchWait } from '../../controller/redux/app-reducer';
import { fetchLoginSuccess } from '../../controller/redux/login-fetch-reducers';
import { isEmpty, clone } from './commonFunction';
import * as CONSTANTS from './constants';
import * as cmFunction from 'common/ulti/commonFunction'
import { HOST_API, AUTH_REFRESH_TOKEN } from '../../controller/api';



export const axiosConfig = (store) => {
  let isRefreshing = false;
  let failedQueue = [];
  let countRequest = 0;
  let countResponse = 0;
  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    })

    failedQueue = [];
  }
  // for multiple requests

  axios.interceptors.request.use(function (config) {
    if (!isEmpty(store.getState().LoginRes)) {
      config.headers['Authorization'] = 'Bearer ' + store.getState().LoginRes.access_token
      config.headers['Permission'] = cmFunction.encode(JSON.stringify(store.getState().LoginRes.roles))
    }
    // config.timeout = 5000
    //wait
    countRequest++
    store.dispatch(fetchWait(true))//wait
    return config;
  }, function (error) {
    store.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Hệ thống đang bận xin vui lòng thử lại sau ít phút' }))
    return Promise.reject(error);
  })

  try {
    axios.interceptors.response.use(res => {
      //wait
      countResponse++
      if (countResponse === countRequest) {
        store.dispatch(fetchWait(false))
        countResponse = 0
        countRequest = 0
      }//wait
      if ((res.status === 200 || res.status === 201) && isEmpty(res.data)) {
        res.data = true
      }
      return res
    }, error => {
      //wait
      countResponse++
      if (countResponse === countRequest) {
        store.dispatch(fetchWait(false))
        countResponse = 0
        countRequest = 0
      }//wait
      if (CONSTANTS.__DEV__) console.log(error.response)
      if (error.response && error.response.status && error.response.status === 405) {
        if (error.response.config.method === 'get') {
          if (!CONSTANTS.__DEV__) cmFunction.goBack()
        }
      }
      // for multiple requests
      const originalRequest = error.config;
      if (error.response && error.response.status && error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          })
        }
        originalRequest._retry = true;
        isRefreshing = true;
        const refreshToken = clone(store.getState().LoginRes);
        return new Promise(function (resolve, reject) {
          axios.get(`${HOST_API}${AUTH_REFRESH_TOKEN}`)
            .then(async ({ data }) => {
              refreshToken.access_token = data.access_token
              refreshToken.access_token_expired = data.access_token_expired
              store.dispatch(fetchLoginSuccess(refreshToken))
              await setCookie(CONSTANTS.AUTHORIZATION_COOKIE, cmFunction.encode(JSON.stringify(refreshToken)))

              axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
              originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
              processQueue(null, data.access_token);
              resolve(axios(originalRequest));
            })
            .catch((err) => {
              processQueue(err, null);
              reject(err);
            })
            .then(() => { isRefreshing = false })
        })
      }
      // end for multiple requests
      var errorMsg = error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Lỗi dịch vụ. Vui lòng thử lại sau ít phút hoặc liên hệ quản trị viên.';
      store.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: errorMsg }))
      return { error: error }
    })
  } catch (error) {
    store.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Lỗi dịch vụ. Vui lòng thử lại sau ít phút hoặc liên hệ quản trị viên.' }))
  }
}