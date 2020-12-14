import { Axios } from "./axios"
import { HOST_API, GSP } from '../api'


function getDanhMucQuocGia(method, url) {
  // query = query ? ('?' + query) : ''
  return Axios('post', `${HOST_API}${GSP}`, {
    "method": method,
    "svcUrl": url
  })
}

function getDanhMucQuocGiaById(table, id) {
  return Axios('get', `${HOST_API}${GSP}${table ? '/' + table : ''}${id ? '/' + id : ''}`)
}

export { getDanhMucQuocGia, getDanhMucQuocGiaById }
