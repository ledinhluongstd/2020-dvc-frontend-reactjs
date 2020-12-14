import { Axios } from "./axios"
import { HOST_API, GENERAL } from '../api'

function getMenu(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${GENERAL}${'/menu'}${query}`)
}

function getNhomQuyen(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${GENERAL}${'/nhom-quyen'}${query}`)
}

function getDanhMucUngDung(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${GENERAL}${'/danh-muc-ung-dung'}${query}`)
}

export { getMenu, getNhomQuyen, getDanhMucUngDung }

