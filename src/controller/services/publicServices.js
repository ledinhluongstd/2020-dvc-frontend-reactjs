import { Axios } from "./axios"
import { HOST_API, PUBLIC, PUBLIC_DMDCQG, PUBLIC_LINH_VUC, PUBLIC_DANH_MUC, PUBLIC_LOAI_DANH_MUC, PUBLIC_NHOM_DANH_MUC, PUBLIC_THUOC_TINH_DANH_MUC, PUBLIC_GSP } from '../api'
import { GSP_DMDC } from "../../../config"

function getLinhVuc(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${PUBLIC}${PUBLIC_LINH_VUC}${query}`)
}

function getDanhMuc(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${PUBLIC}${PUBLIC_DANH_MUC}${query}`)
}

function getDanhMucById(id) {
  return Axios('get', `${HOST_API}${PUBLIC}${PUBLIC_DANH_MUC}/${id}`)
}

function getLoaiDanhMuc(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${PUBLIC}${PUBLIC_LOAI_DANH_MUC}${query}`)

}

function getNhomDanhMuc(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${PUBLIC}${PUBLIC_NHOM_DANH_MUC}${query}`)

}

function getThuocTinhDanhMuc(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${PUBLIC}${PUBLIC_THUOC_TINH_DANH_MUC}${query}`)
}

function getDanhMucQuocGia(method, url) {
  return Axios('post', `${HOST_API}${PUBLIC}${PUBLIC_GSP}`, {
    "method": method,
    "svcUrl": url
  })
}

function getDanhMucQuocGiaBQP(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${PUBLIC}${PUBLIC_DMDCQG}${query}`)
}

function getDanhMucQuocGiaBQPById(id) {
  return Axios('get', `${HOST_API}${PUBLIC}${PUBLIC_DMDCQG}${'/'}${id}`)
}

export {
  getLinhVuc, getDanhMuc, getDanhMucById, getLoaiDanhMuc, getNhomDanhMuc, getThuocTinhDanhMuc, getDanhMucQuocGia,
  getDanhMucQuocGiaBQP, getDanhMucQuocGiaBQPById
}
