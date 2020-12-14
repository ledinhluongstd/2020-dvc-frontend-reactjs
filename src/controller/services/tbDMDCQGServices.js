
import { Axios } from "./axios"
import { TB_DMDCQG, DATA, HOST_API } from '../api'
import { __DEV__ } from "../../common/ulti/constants";


function getAll(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${DATA}${TB_DMDCQG}${query}`)
}

function checkCategoryCode(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${DATA}${TB_DMDCQG}${'/check'}${query}`)
}


function create(data) {
  return Axios('post', `${HOST_API}${DATA}${TB_DMDCQG}`, data)
}

function getById(id) {
  return Axios('get', `${HOST_API}${DATA}${TB_DMDCQG}${'/'}${id}`)
}

function updateById(id, data) {
  return Axios('patch', `${HOST_API}${DATA}${TB_DMDCQG}${'/'}${id}`, data)
}

function updatePutById(id, data) {
  return Axios('put', `${HOST_API}${DATA}${TB_DMDCQG}${'/'}${id}`, data)
}

function lockById(id) {
  return Axios('lock', `${HOST_API}${DATA}${TB_DMDCQG}${'/'}${id}`)
}

function deleteById(id) {
  return Axios('delete', `${HOST_API}${DATA}${TB_DMDCQG}${'/'}${id}`)
}

export { getAll, create, getById, updateById, updatePutById, lockById, deleteById, checkCategoryCode }