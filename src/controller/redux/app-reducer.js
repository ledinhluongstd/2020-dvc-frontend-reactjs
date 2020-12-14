import { createAction } from 'redux-actions';

export const FETCH_GENERAL = 'FETCH_GENERAL';
export const fetchGeneral = createAction(FETCH_GENERAL);
export function fetchGeneralReducer(General = {}, action) {
  switch (action.type) {
    case FETCH_GENERAL:
      return action.payload;
    default:
      return General;
  }
}

export const FETCH_TOAST_NOTIFY = 'FETCH_TOAST_NOTIFY';
export const fetchToastNotify = createAction(FETCH_TOAST_NOTIFY);
export function fetchToastNotifyReducer(ToastNotify = {}, action) {
  switch (action.type) {
    case FETCH_TOAST_NOTIFY:
      return action.payload;
    default:
      return ToastNotify;
  }
}


export const FETCH_WAIT = 'FETCH_WAIT';
export const fetchWait = createAction(FETCH_WAIT);
export function fetchWaitReducer(Wait = false, action) {
  switch (action.type) {
    case FETCH_WAIT:
      return action.payload;
    default:
      return Wait;
  }
}




