import { Axios } from "./axios"
import { HOST_API, DATA, IMPORT_EXCEL } from '../api'


function importExcelDanhMuc(data) {
  return Axios('post',`${HOST_API}${DATA}${IMPORT_EXCEL}${'/danh-muc'}`, data)
}

function importExcelNhomDanhMuc(data) {
  return Axios('post',`${HOST_API}${DATA}${IMPORT_EXCEL}${'/nhom-danh-muc'}`, data)
}

export { importExcelDanhMuc, importExcelNhomDanhMuc }
