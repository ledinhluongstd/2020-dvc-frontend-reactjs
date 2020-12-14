// define root api
import { HTTP_API, NEXT_CLOUD_IFRAME } from '../../config'
export const HOST_API = HTTP_API
export const HOST_NEXT_CLOUD = NEXT_CLOUD_IFRAME

export const REGISTER_GET_TOKEN = '/register/get_token'
export const REGISTER_VERIFY_TOKEN = '/register/verify_token'
export const REGISTER_CHECK_ACCOUNT = '/api/users/register/check-account'
export const REGISTER_CREATE = '/api/users/register/create'

//AUTH vs REGISTER vs USERS
export const AUTH_SIGNIN = '/api/auth/signin'
export const AUTH_OUT = '/api/auth/signout'
export const AUTH_REFRESH_TOKEN = '/api/auth/refresh-token'
export const CHANGE_PROFILE = '/api/users/change-profile'
export const USER_UPDATE = '/api/users/update'

//DATA
export const DATA = '/api/data'
export const GMAP = '/api/gmap'
export const GENERAL = '/api/general'
export const MEDIA_UPLOAD = '/api/media/upload'
export const MEDIA_DOWNLOAD = '/api/media/download'
export const MEDIA_FILE = '/api/media/file'
export const MEDIA_VIDEO = '/api/media/video'
export const AGGRS = '/api/aggrs'

//NEXTCLOUD
export const NEXT_CLOUD_REQUEST_TOKEN = '/api/nextcloud/request-token'

// TABLE
export const TB_MENU = '/tbMenu'
export const TB_DANH_SACH_DEMO = '/tbDanhSachDemo'
export const TB_DON_VI_HANH_CHINH = '/tbDonViHanhChinh'
export const TB_USERS = '/tbUsers'
export const TB_DON_VI = '/tbDonVi'
export const TB_DANH_MUC_UNG_DUNG = '/tbDanhMucUngDung'
export const TB_LINH_VUC = '/tbLinhVuc'
export const TB_EFORM = '/tbEform'
export const TB_THONG_TIN_EFORM = '/tbThongTinEform'
export const TB_NHOM_DANH_MUC = '/tbNhomDanhMuc'
export const TB_THUOC_TINH_DANH_MUC = '/tbThuocTinhDanhMuc'
export const TB_DANH_MUC = '/tbDanhMuc'
export const TB_Y_KIEN_DONG_GOP = '/tbYKienDongGop'
export const TB_LOG_API = '/tbLogApi'
export const TB_LOG_DVC = '/tbLogDVC'
export const TB_THONG_KE = '/tbThongKe'
export const TB_DMDCQG = '/tbDMDCQG'
export const TB_DVC = '/tbDVC'
export const TB_UNG_DUNG = '/tbUngDung'
export const TB_UNG_DUNG_DVC = '/tbUngDungDVC'
export const TB_CAU_HINH_KET_NOI = '/tbCauHinhKetNoi'
export const TB_CAU_HINH_HE_THONG = '/tbCauHinhHeThong'

export const IMPORT_EXCEL = '/import-excel'

//QUAN TRI
export const TB_CHUC_NANG = '/tbChucNang'
export const TB_NHOM_QUYEN = '/tbNhomQuyen'
export const TB_NHOM_QUYEN_CHUC_NANG = '/tbNhomQuyenChucNang'
export const TB_NHOM_QUYEN_NGUOI_DUNG = '/tbNhomQuyenNguoiDung'

// DASHBOARD
export const AGGRS_DANH_MUC = '/danh-muc'
export const AGGRS_NHOM_DANH_MUC = '/nhom-danh-muc'
export const AGGRS_DON_VI = '/don-vi'
export const AGGRS_USER = '/user'
export const AGGRS_THONG_KE = '/thong-ke'
export const AGGRS_LINH_VUC = '/linh-vuc'
export const AGGRS_LOG_DVC = '/log-dvc'

// PUBLIC
export const PUBLIC = '/api/public'
export const PUBLIC_DANH_MUC = '/danh-muc'
export const PUBLIC_LOAI_DANH_MUC = '/loai-danh-muc'
export const PUBLIC_NHOM_DANH_MUC = '/nhom-danh-muc'
export const PUBLIC_THUOC_TINH_DANH_MUC = '/thuoc-tinh-danh-muc'
export const PUBLIC_LINH_VUC = '/linh-vuc'
export const PUBLIC_GSP = '/gsp'
export const PUBLIC_DMDCQG = '/gsp/tbDMDCQG'

// GSP
export const GSP = '/api/gsp'
// DVC
export const DVC = '/api/dvc'

