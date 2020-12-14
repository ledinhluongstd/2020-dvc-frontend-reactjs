import { Axios } from "./axios"
import { HOST_API, NEXT_CLOUD_REQUEST_TOKEN } from '../api'


function getToken() {
  return Axios('get', `${HOST_API}${NEXT_CLOUD_REQUEST_TOKEN}`)
}

export { getToken }
