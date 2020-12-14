import { createAction } from 'redux-actions';
import axios from 'axios';
import { Observable } from 'rxjs';
import * as ccFunction from '../../common/ulti/cookieFunction'
import { AUTH_SIGNIN, HOST_API } from '../api'
import { AUTHORIZATION_COOKIE } from '../../common/ulti/constants';
import * as cmFunction from 'common/ulti/commonFunction'

export const FETCH_LOGIN_REQUEST = 'FETCH_LOGIN_REQUEST';
export const FETCH_LOGIN_SUCCESS = 'FETCH_LOGIN_SUCCESS';
export const FETCH_LOGIN_FAILURE = 'FETCH_LOGIN_FAILURE';

export const fetchLoginRequest = createAction(FETCH_LOGIN_REQUEST);
export const fetchLoginSuccess = createAction(FETCH_LOGIN_SUCCESS);
export const fetchLoginFailure = createAction(FETCH_LOGIN_FAILURE);

export const fetchLoginEpic = (action, store) =>
  action.ofType(FETCH_LOGIN_REQUEST)
    .mergeMap(() => {
      return axios.post(`${HOST_API}${AUTH_SIGNIN}`, store.getState().LoginReq)
        .then(res => {
          if (res.data) {
            return fetchLoginSuccess(res.data);
          }
          else {
            return fetchLoginFailure({})
          }
        })
        .catch(error => {
          return fetchLoginFailure({})
        })
    });

export function requestLoginReducer(LoginReq = {}, action) {
  switch (action.type) {
    case FETCH_LOGIN_REQUEST:
      return action.payload;
    default:
      return LoginReq;
  }
}

export function fetchLoginReducer(LoginRes = {}, action) {
  switch (action.type) {
    case FETCH_LOGIN_SUCCESS:
      ccFunction.setCookie(AUTHORIZATION_COOKIE, cmFunction.encode(JSON.stringify(action.payload)))
      return action.payload;
    case FETCH_LOGIN_FAILURE:
      ccFunction.deleteCookie(AUTHORIZATION_COOKIE)
      return action.payload;
    default:
      return LoginRes;
  }
}
