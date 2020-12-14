import * as tbDanhSachDemo from 'controller/services/tbDanhSachDemoServices'
import * as tbDonVi from 'controller/services/tbDonViServices'
import * as tbDonViHanhChinh from 'controller/services/tbDonViHanhChinhServices'
import * as cmFunction from './commonFunction'
import { DEV } from '../../../config'

export const AUTHORIZATION_COOKIE = "AUTHORIZATION_COOKIE_PRODUC"
export const __DEV__ = DEV
export const SUCCESS = 'success'
export const INFO = 'info'
export const ERROR = 'error'
export const WARNING = 'warning'
export const SUPER = { roles: 'BIG_DADY' }
export const GUEST = 'GUEST'
export const PAGINATION_SIZE = [{ label: "10", value: 10 }, { label: "20", value: 20 }, { label: "50", value: 50 }, { label: "200", value: 200 }, { label: "500", value: 500 }, { label: "1000", value: 1000 }]
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGESIZE = 10
//DANH MUC CONST
export const MA_DANH_MUC = {
  NhomDonViKetNoi: { Ma: "NhomDonViKetNoi", Ten: "Nhóm đơn vị kết nối..." },
  NhomDichVuCungCap: { Ma: "NhomDichVuCungCap", Ten: "Nhóm dịch vụ cung cấp..." },
  NhomDichVuUngDung: { Ma: "NhomDichVuUngDung", Ten: "Nhóm dịch vụ ứng dụng..." },
};
//KIEU DU LIEU
export const KIEU_DU_LIEU = {
  number: { value: 'number', label: 'Số' },
  text: { value: 'text', label: 'Nhập liệu' },
  date: { value: 'date', label: 'Ngày tháng' },
  select: { value: 'select', label: 'Lựa chọn' },
  radio: { value: 'radio', label: 'Radio' },
  // checkbox: { value: 'checkbox', label: 'Checkbox' },
}
export const KIEU_DU_LIEU_V2 = {
  number: { value: 'number', label: 'Số' },
  text: { value: 'text', label: 'Nhập liệu' },
  date: { value: 'date', label: 'Ngày tháng' },
  boolean: { value: 'boolean', label: 'Logic' },
  select: { value: 'select', label: 'Lựa chọn' },
  radio: { value: 'radio', label: 'Radio' },
  arrays: { value: 'arrays', label: 'Danh sách' },
}
//SEARCH CONST
export const SEARCH_DEMO = [
  { id: "HoTen", label: "Tên", type: "react-select-db", defaultOptions: true, function: tbDanhSachDemo.getAll, key: "HoTen", math: "%", filter: {}, stt: 1, show: true },
  { id: "TinhThanh.Ten", label: "Tỉnh thành", type: "react-select-db", defaultOptions: true, function: tbDonViHanhChinh.getAll, key: "Ten", math: "%", filter: { Loai: 'Tinh' }, stt: 1, show: true },
  { id: "QuanHuyen.Ten", label: "Quận huyện", type: "react-select-db", defaultOptions: true, function: tbDonViHanhChinh.getAll, key: "Ten", math: "%", filter: { Loai: 'QuanHuyen' }, stt: 1, show: true },
  { id: "HinhThuc.Ten", label: "Hình thức cách ly", type: "select", key: "HinhThucCachLy", stt: 1, show: true },
  { id: "TinhTrang.Ma", label: "Tình trạng", type: "select", key: "TinhTrangBenhNhan", stt: 1, show: true },
  { id: "ThoiGianNhap", label: "Thời gian cách ly", type: "no-date", stt: 1, show: true },
  { id: "ThoiGianXuat", label: "Thời gian hết cách ly", type: "no-date", stt: 1, show: true },
]
export const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/igm
export const VN_PHONE_NUMBER = /(\+84|0)\d{9}/g
export const LABEL_VALID_ERROR_NAME = "label-valid-error"
export const ICONSET = [
  { value: "Báo cáo", icon: "fa-tachometer-alt" },
  { value: "Người dùng", icon: "fa-user" },
  { value: "Nhóm người", icon: "fa-users" },
  { value: "Nhóm quyền", icon: "fa-users-cog" },
  { value: "Nhà", icon: "fa-home" },
  { value: "Khóa", icon: "fa-lock" },
  { value: "Xóa", icon: "fa-trash" },
  { value: "Bánh răng", icon: "fa-cogs" },
  { value: "Danh sách", icon: "fa-list" },
  { value: "Đơn vị", icon: "fa-university" },
  { value: "Cây tổ chức", icon: "fa-sitemap" },
  { value: "book", icon: "fa-book" },
  { value: "Bánh răng 1", icon: "fa-cog" },
  { value: "Lịch", icon: "fa-calendar" },
  { value: "Chuông", icon: "fa-bell" },
  { value: "Chuông hủy", icon: "fa-bell-slash" },
  { value: "Xác nhận", icon: "fa-check" },
  { value: "Loa", icon: "fa-bullhorn" },
  { value: "Tòa nhà", icon: "fa-building" },
  { value: "Lớp", icon: "fa-layer-group" },
  { value: "Lửa", icon: "fa-burn" },
  { value: "Hộp tế", icon: "fa-briefcase-medical" },
  { value: "Vali", icon: "fa-briefcase" },
  { value: "Xe buýt", icon: "fa-bus" },
  { value: "Camera", icon: "fa-camera" },
  { value: "Xe ôtô", icon: "fa-car" },
  { value: "Tai nạn", icon: "fa-car-crash" },
  { value: "Ống nhòm", icon: "fa-binoculars" },
  { value: "Cười", icon: "fa-smile" },
  { value: "Kết nối", icon: "fa-link" }
]
export const VIDEO = ['video/m1v', 'video/mpeg', 'video/mov', 'video/qt', 'video/mpa', 'video/mpg', 'video/mpe', 'video/avi', 'video/movie', 'video/mp4', 'video']
export const AUDIO = ['ra', 'aif', 'aiff', 'aifc', 'wav', 'au', 'snd', 'mp3', 'mp2']
export const IMAGE = ['image/ras', 'image/xwd', 'image/bmp', 'image/jpe', 'image/jpg', 'image/jpeg', 'image/xpm', 'image/ief', 'image/pbm', 'image/tif', 'image/gif', 'image/ppm', 'image/xbm', 'image/tiff', 'image/rgb', 'image/pgm', 'image/png', 'image/pnm', 'image']
export const DOCUMENT = ['.xlsx', '.xls', '.pdf', '.doc', '.docx', '.pptx', '.ppt', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.ms-excel', 'msword', 'vnd.openxmlformats-officedocument.wordprocessingml.document', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.ms-powerpoint']
export const ICONSET_FOR_FILE = [
  {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document@vnd.msword@docx@application/msword',
    name: 'fa-file-word',
    class: 'ic-blue'
  },
  {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet@vnd.ms-excel@xlsx',
    name: 'fa-file-excel',
    class: 'ic-green'
  },
  {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation@vnd.ms-powerpoint@pptx',
    name: 'fa-file-powerpoint',
    class: 'ic-orangered'
  },
  { type: 'application/pdf', name: 'fa-file-pdf', class: 'ic-red' },
  // { type: 'image/jpg', name: 'fa-file-image', class: '' },
  // { type: 'image/jpeg', name: 'fa-file-image', class: '' },
  // { type: 'image/png', name: 'fa-file-image', class: '' },
  {
    type: 'image/ras@image/xwd@image/bmp@image/jpe@image/jpg@image/jpeg@image/xpm@image/ief@image/pbm@image/tif@image/gif@image/ppm@image/xbm@image/tiff@image/rgb@image/pgm@image/png@image/pnm@image',
    name: 'fa-file-image',
    class: ''
  }
]
export const DEFAULT_IC_FOR_FILE = { type: '', name: 'fa-file', class: '' }
export const STATISTICS_TYPE = {
  COUNTER_STATISTICS: 'COUNTER_STATISTICS', // số lượt truy cập
  CATEGORY_SEARCH_STATISTICS: 'CATEGORY_SEARCH_STATISTICS',  // thống kê tìm kiếm danh mục category search statistics
  PUBLIC_CATEGORY_SEARCH_STATISTICS: 'PUBLIC_CATEGORY_SEARCH_STATISTICS',  //công khai, thống kê tìm kiếm danh mục category search statistics
}

export const THEME = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};