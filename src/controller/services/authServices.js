import { Axios } from "./axios"
import { STATISTIC, HOST_API, AUTH_OUT, AUTH_REFRESH_TOKEN } from '../api'

function authSignOut(device_token) {
  return Axios('get', `${HOST_API}${AUTH_OUT}${'?ft='}${device_token}`)
}

function authRefreshToken() {
  return Axios('get', `${HOST_API}${AUTH_REFRESH_TOKEN}`)
}

export { authSignOut, authRefreshToken }

