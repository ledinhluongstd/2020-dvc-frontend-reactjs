
import { Axios } from "./axios"
import { TB_DVC, DVC, DATA, HOST_API } from '../api'
import { __DEV__ } from "../../common/ulti/constants";

function getAllServices(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${DVC}${'/all-services'}${query}`)
}

function generateApiToken() {
  // query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${DVC}${'/generate-api-token'}`)
}

function getAll(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${DATA}${TB_DVC}${query}`)
}

function create(data) {
  return Axios('post', `${HOST_API}${DATA}${TB_DVC}`, data)
}

function getById(id) {
  return Axios('get', `${HOST_API}${DATA}${TB_DVC}${'/'}${id}`)
}

function updateById(id, data) {
  return Axios('patch', `${HOST_API}${DATA}${TB_DVC}${'/'}${id}`, data)
}

function lockById(id) {
  return Axios('lock', `${HOST_API}${DATA}${TB_DVC}${'/'}${id}`)
}

function deleteById(id) {
  return Axios('delete', `${HOST_API}${DATA}${TB_DVC}${'/'}${id}`)
}

export { getAllServices, generateApiToken, getAll, create, getById, updateById, lockById, deleteById }