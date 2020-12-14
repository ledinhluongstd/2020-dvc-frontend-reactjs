
import { Axios } from "./axios"
import { TB_DON_VI, DATA, HOST_API } from '../api'
import { __DEV__ } from "../../common/ulti/constants";

function getAll(query) {
  query = query ? ('?' + query) : ''
  return Axios('get',`${HOST_API}${DATA}${TB_DON_VI}${query}`)
}

function create(data) {
  return Axios('post',`${HOST_API}${DATA}${TB_DON_VI}`, data)
}

function getById(id) {
  return Axios('get',`${HOST_API}${DATA}${TB_DON_VI}${'/'}${id}`)
}

function updateById(id, data) {
  return Axios('patch',`${HOST_API}${DATA}${TB_DON_VI}${'/'}${id}`, data)
}

function lockById(id) {
  return Axios('lock',`${HOST_API}${DATA}${TB_DON_VI}${'/'}${id}`)
}

function deleteById(id) {
  return Axios('delete',`${HOST_API}${DATA}${TB_DON_VI}${'/'}${id}`)
}

export { getAll, create, getById, updateById, lockById, deleteById }