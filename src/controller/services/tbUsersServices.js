
import { Axios } from "./axios"
import { HOST_API, TB_USERS, DATA, CHANGE_PROFILE, REGISTER_CREATE, USER_UPDATE } from '../api'

function getAll(query) {
  query = query ? ('?' + query) : ''
  return Axios('get', `${HOST_API}${DATA}${TB_USERS}${query}`)
}

function getById(id) {
  return Axios('get', `${HOST_API}${DATA}${TB_USERS}${'/'}${id}`)
}

function lockById(id) {
  return Axios('lock', `${HOST_API}${DATA}${TB_USERS}${'/'}${id}`)
}

function deleteById(id) {
  return Axios('delete', `${HOST_API}${DATA}${TB_USERS}${'/'}${id}`)
}

//
function create(data) {
  return Axios('post', `${HOST_API}${REGISTER_CREATE}`, data)
}

function register(data) {
  return Axios('post', `${HOST_API}${REGISTER_CREATE}`, data)
}

function updateById(id, data) {
  return Axios('patch', `${HOST_API}${USER_UPDATE}${'/'}${id}`, data)
}

function changeProfile(id, data) {
  return Axios('patch', `${HOST_API}${CHANGE_PROFILE}${'/'}${id}`, data)
}

export { getAll, create, getById, updateById, changeProfile, lockById, deleteById, register }