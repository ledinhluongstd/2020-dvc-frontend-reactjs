
// import { Axios } from "./axios"
// import { TB_UNG_DUNG_DVC_DVC, DATA, HOST_API } from '../api'
// import { __DEV__ } from "../../common/ulti/constants";

// function getAll(query) {
//   query = query ? ('?' + query) : ''
//   return Axios('get', `${HOST_API}${DATA}${TB_UNG_DUNG_DVC}${query}`)
// }

// function create(data) {
//   return Axios('post', `${HOST_API}${DATA}${TB_UNG_DUNG_DVC}`, data)
// }

// function getById(id) {
//   return Axios('get', `${HOST_API}${DATA}${TB_UNG_DUNG_DVC}${'/'}${id}`)
// }

// function updateById(id, data) {
//   return Axios('patch', `${HOST_API}${DATA}${TB_UNG_DUNG_DVC}${'/'}${id}`, data)
// }

// function lockById(id) {
//   return Axios('lock', `${HOST_API}${DATA}${TB_UNG_DUNG_DVC}${'/'}${id}`)
// }

// function deleteById(id) {
//   return Axios('delete', `${HOST_API}${DATA}${TB_UNG_DUNG_DVC}${'/'}${id}`)
// }

// export { getAll, create, getById, updateById, lockById, deleteById }