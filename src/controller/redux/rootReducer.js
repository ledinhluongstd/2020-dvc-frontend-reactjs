import { combineReducers } from 'redux';

import { requestLoginReducer, fetchLoginReducer } from './login-fetch-reducers'
import { fetchWaitReducer, fetchGeneralReducer, fetchToastNotifyReducer } from './app-reducer'

const rootReducer = combineReducers({
  // app-reducer
  General: fetchGeneralReducer,
  Wait: fetchWaitReducer,
  ToastNotify: fetchToastNotifyReducer,
  // screen-reducer
  LoginReq: requestLoginReducer, // login request
  LoginRes: fetchLoginReducer,// login response--

});

export default rootReducer;
