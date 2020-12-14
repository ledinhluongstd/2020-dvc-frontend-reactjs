import { Axios } from "./axios"
import { HOST_API, GMAP } from '../api'

function gmapServices(query) {
  return Axios('get',`${HOST_API}${GMAP}${query}`)
}

function getSuggestions(value) {
  let query = `/place/autocomplete/json?input=${value}${'&sensor=true&language='}${'vi'}`
  return Axios('get',`${HOST_API}${GMAP}${query}`)
}

function getPlaceId(place_id) {
  let query = `/place/details/json?placeid=${place_id}${'&sensor=true&language='}${'vi'}`
  return Axios('get',`${HOST_API}${GMAP}${query}`)
}

export { gmapServices, getSuggestions, getPlaceId }
