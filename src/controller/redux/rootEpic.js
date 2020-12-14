import { combineEpics } from 'redux-observable';

import { fetchLoginEpic } from '../../controller/redux/login-fetch-reducers'
const rootEpic = combineEpics(
    fetchLoginEpic,
)

export default rootEpic;
