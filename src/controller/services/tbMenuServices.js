
import { Axios } from "./axios"
import { HOST_API, DATA, TB_MENU } from '../api'
import { __DEV__ } from "../../common/ulti/constants";

function getAll(query) {
  query = query ? ('?' + query) : ''
  return Axios('get',`${HOST_API}${DATA}${TB_MENU}${query}`)
}

function create(data) {
  return Axios('post',`${HOST_API}${DATA}${TB_MENU}`, data)
}

function getById(id) {
  return Axios('get',`${HOST_API}${DATA}${TB_MENU}${'/'}${id}`)
}

function updateById(id, data) {
  return Axios('patch',`${HOST_API}${DATA}${TB_MENU}${'/'}${id}`, data)
}

function lockById(id) {
  return Axios('lock',`${HOST_API}${DATA}${TB_MENU}${'/'}${id}`)
}

function deleteById(id) {
  return Axios('delete',`${HOST_API}${DATA}${TB_MENU}${'/'}${id}`)
}

export { getAll, create, getById, updateById, lockById, deleteById }