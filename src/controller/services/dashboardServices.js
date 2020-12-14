import { Axios } from "./axios"
import { HOST_API, AGGRS, AGGRS_LINH_VUC, AGGRS_LOG_DVC, AGGRS_DANH_MUC, AGGRS_DON_VI, AGGRS_NHOM_DANH_MUC, AGGRS_USER, AGGRS_THONG_KE } from '../api'

function countLinhVuc(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_LINH_VUC}${query}`)
}

function countDanhMuc(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_DANH_MUC}${query}`)
}

function countNhomDanhMuc(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_NHOM_DANH_MUC}${query}`)
}

function countDonVi(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_DON_VI}${query}`)
}

function countUser(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_USER}${query}`)
}

function countSuccessOrError(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_LOG_DVC}${`/thong-ke-theo-thoi-gian`}${query}`)
}

function statisticalSuccessOrErrorServiceByTime(query) {
  query = query ? ('?' + query) : ''
  console.log(query)
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_LOG_DVC}${`/thong-ke-dich-vu-theo-thoi-gian`}${query}`)
}


function statisticalSuccessOrErrorUnitByTime(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_LOG_DVC}${`/thong-ke-don-vi-theo-thoi-gian`}${query}`)
}

function statisticalSuccessOrErrorDVUngDungByTime(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_LOG_DVC}${`/thong-ke-ung-dung-theo-thoi-gian`}${query}`)
}

function countTopSuccessSerrvice(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_LOG_DVC}${`/top-dich-vu-thanh-cong`}${query}`)
}

function countTopSuccessUnit(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_LOG_DVC}${`/top-don-vi-thanh-cong`}${query}`)
}

function counterStatistics(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_THONG_KE}${`/luot-truy-cap`}${query}`)
}

function categorySearchStatistics(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_THONG_KE}${`/tim-kiem-danh-muc`}${query}`)
}

function publicCategorySearchStatistics(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${AGGRS}${AGGRS_THONG_KE}${`/khach-tim-kiem-danh-muc`}${query}`)
}


export {
  countLinhVuc,
  countDanhMuc, countNhomDanhMuc, countDonVi, countUser, countSuccessOrError,
  countTopSuccessSerrvice, countTopSuccessUnit, statisticalSuccessOrErrorServiceByTime,
  statisticalSuccessOrErrorUnitByTime, statisticalSuccessOrErrorDVUngDungByTime,
  counterStatistics, categorySearchStatistics, publicCategorySearchStatistics
}

