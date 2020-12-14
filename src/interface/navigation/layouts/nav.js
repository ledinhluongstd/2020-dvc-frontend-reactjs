
import React from 'react';
// @material-ui/icons
import { Dashboard, Warning } from "@material-ui/icons";

//loadable
import loadable from 'react-loadable';
import { LoadingComponent } from 'interface/components'

const CaNhan = loadable({ loader: () => import('interface/screens/canhan/thongtin'), loading: LoadingComponent });
const MatKhau = loadable({ loader: () => import('interface/screens/canhan/matkhau'), loading: LoadingComponent });
//QUANLy
const DanhSachDonVi = loadable({ loader: () => import('interface/screens/donvi/danhsach'), loading: LoadingComponent });
const ChiTietDonVi = loadable({ loader: () => import('interface/screens/donvi/chitiet'), loading: LoadingComponent });
const XemDonVi = loadable({ loader: () => import('interface/screens/donvi/xem'), loading: LoadingComponent });
// const DanhSachLinhVuc = loadable({ loader: () => import('interface/screens/linhvuc/danhsach'), loading: LoadingComponent });
// const ChiTietLinhVuc = loadable({ loader: () => import('interface/screens/linhvuc/chitiet'), loading: LoadingComponent });
// const DanhSachEform = loadable({ loader: () => import('interface/screens/eform/danhsach'), loading: LoadingComponent });
// const ChiTietEform = loadable({ loader: () => import('interface/screens/eform/chitiet'), loading: LoadingComponent });
// const ChinhSuaEform = loadable({ loader: () => import('interface/screens/eform/chinhsua'), loading: LoadingComponent });
// const DanhSachThongTinEform = loadable({ loader: () => import('interface/screens/thongtineform/danhsach'), loading: LoadingComponent });
// const ChiTietThongTinEform = loadable({ loader: () => import('interface/screens/thongtineform/chitiet'), loading: LoadingComponent });
// const DanhSachThuocTinhDanhMuc = loadable({ loader: () => import('interface/screens/thuoctinhdanhmuc/danhsach'), loading: LoadingComponent });
// const ChiTietThuocTinhDanhMuc = loadable({ loader: () => import('interface/screens/thuoctinhdanhmuc/chitiet'), loading: LoadingComponent });
// const DanhSachNhomDanhMuc = loadable({ loader: () => import('interface/screens/nhomdanhmuc/danhsach'), loading: LoadingComponent });
// const ChiTietNhomDanhMuc = loadable({ loader: () => import('interface/screens/nhomdanhmuc/chitiet'), loading: LoadingComponent });



//QUANTRI
const DanhSachNhomQuyen = loadable({ loader: () => import('interface/screens/nhomquyen/danhsach'), loading: LoadingComponent });
const ChiTietNhomQuyen = loadable({ loader: () => import('interface/screens/nhomquyen/chitiet'), loading: LoadingComponent });
const DanhSachNguoiDung = loadable({ loader: () => import('interface/screens/nguoidung/danhsach'), loading: LoadingComponent });
const ChiTietNguoiDung = loadable({ loader: () => import('interface/screens/nguoidung/chitiet'), loading: LoadingComponent });
const DanhSachDanhMuc = loadable({ loader: () => import('interface/screens/danhmucungdung/danhsach'), loading: LoadingComponent });
const ChiTietDanhMuc = loadable({ loader: () => import('interface/screens/danhmucungdung/chitiet'), loading: LoadingComponent });
const DanhSachMenu = loadable({ loader: () => import('interface/screens/menu/danhsach'), loading: LoadingComponent });
const ChiTietMeNu = loadable({ loader: () => import('interface/screens/menu/chitiet'), loading: LoadingComponent });
const PhanQuyen = loadable({ loader: () => import('interface/screens/phanquyen'), loading: LoadingComponent });
const DanhSachLogApi = loadable({ loader: () => import('interface/screens/logapi/danhsach'), loading: LoadingComponent });
const ChiTietLogApi = loadable({ loader: () => import('interface/screens/logapi/chitiet'), loading: LoadingComponent });
const DongGopYKien = loadable({ loader: () => import('interface/screens/donggopykien/index'), loading: LoadingComponent });
const DanhSachDongGopYKien = loadable({ loader: () => import('interface/screens/donggopykien/danhsach'), loading: LoadingComponent });
const ChiTietDongGopYKien = loadable({ loader: () => import('interface/screens/donggopykien/chitiet'), loading: LoadingComponent });
// const DanhSachQLDanhMuc = loadable({ loader: () => import('interface/screens/danhmuc/danhsach'), loading: LoadingComponent });
// const ChiTietQLDanhMuc = loadable({ loader: () => import('interface/screens/danhmuc/chitiet'), loading: LoadingComponent });

// Danh mục quốc gia
// const DanhSachNhomDMQuocGia = loadable({ loader: () => import('interface/screens/gsp/dsdanhmuc.bqp'), loading: LoadingComponent });
// const DanhSachNhomDMQuocGia = loadable({ loader: () => import('interface/screens/gsp/dsdanhmuc.tinh'), loading: LoadingComponent });
// const ChiTietDMQuocGia = loadable({ loader: () => import('interface/screens/gsp/chitiet.bqp'), loading: LoadingComponent });
// const ChiTietDMQuocGia = loadable({ loader: () => import('interface/screens/gsp/chitiet.tinh'), loading: LoadingComponent });
// const ImportDMDCQG = loadable({ loader: () => import('interface/screens/gsp/import'), loading: LoadingComponent });
// const LichSuDMDCQGChiTiet = loadable({ loader: () => import('interface/screens/gsp/lichsu.chitiet'), loading: LoadingComponent });
// const LichSuDMDCQG = loadable({ loader: () => import('interface/screens/gsp/lichsu'), loading: LoadingComponent });

//

const HomePage = loadable({ loader: () => import('interface/screens/home'), loading: LoadingComponent });
const Page401 = loadable({ loader: () => import('interface/screens/error/401'), loading: LoadingComponent });
const Page404 = loadable({ loader: () => import('interface/screens/error/404'), loading: LoadingComponent });
const Page500 = loadable({ loader: () => import('interface/screens/error/500'), loading: LoadingComponent });
// const DanhSach = loadable({ loader: () => import('interface/screens/table/danhsach'), loading: LoadingComponent });
// const ChiTiet = loadable({ loader: () => import('interface/screens/table/chitiet'), loading: LoadingComponent });

//DICH VU CONG
const DichVuCungCap = loadable({ loader: () => import('interface/screens/dichvucungcap/danhsach'), loading: LoadingComponent });
const DanhSachGiaoDich = loadable({ loader: () => import('interface/screens/tongquan/danhsachgiaodich'), loading: LoadingComponent });
const ThongKeGiaoDich = loadable({ loader: () => import('interface/screens/tongquan/thongkegiaodich'), loading: LoadingComponent });
const ThongTinKetNoi = loadable({ loader: () => import('interface/screens/tongquan/thongtinketnoi'), loading: LoadingComponent });
// const ThongTinDangNhap = loadable({ loader: () => import('interface/screens/tongquan/thongtindangnhap'), loading: LoadingComponent });

const DichVuCungCapChiTiet = loadable({ loader: () => import('interface/screens/dichvucungcap/chitiet'), loading: LoadingComponent });
const DichVuCungCapXem = loadable({ loader: () => import('interface/screens/dichvucungcap/xem'), loading: LoadingComponent });

const ChiTietQuanTriKetNoi = loadable({ loader: () => import('interface/screens/quantriketnoi/chitiet'), loading: LoadingComponent });
const ChinhSuaQuanTriKetNoi = loadable({ loader: () => import('interface/screens/quantriketnoi/chinhsua'), loading: LoadingComponent });
const QuanTriKetNoi = loadable({ loader: () => import('interface/screens/quantriketnoi/danhsach'), loading: LoadingComponent });
const ChiTietCauHinhKetNoi = loadable({ loader: () => import('interface/screens/cauhinhketnoi/chitiet'), loading: LoadingComponent });
const XemCauHinhKetNoi = loadable({ loader: () => import('interface/screens/cauhinhketnoi/xem'), loading: LoadingComponent });
const CauHinhKetNoi = loadable({ loader: () => import('interface/screens/cauhinhketnoi/danhsach'), loading: LoadingComponent });
const ChitietGiamSatGiaoDich = loadable({ loader: () => import('interface/screens/giamsatgiaodich/chitiet'), loading: LoadingComponent });
const GiamSatGiaoDich = loadable({ loader: () => import('interface/screens/giamsatgiaodich/danhsach'), loading: LoadingComponent });

const DanhSachCauHinhHeThong = loadable({ loader: () => import('interface/screens/cauhinhhethong/danhsach'), loading: LoadingComponent });
const ChiTietCauHinhHeThong = loadable({ loader: () => import('interface/screens/cauhinhhethong/chitiet'), loading: LoadingComponent });

const dashboardRoutes = [
  {
    path: "/ca-nhan",
    component: CaNhan,
    roles: []
  },
  {
    path: "/mat-khau",
    component: MatKhau,
    roles: []
  },
  {
    path: "/home",
    component: HomePage,
    roles: []
  },
  {
    path: "/401",
    component: Page401,
    roles: []
  },
  {
    path: "/404",
    component: Page404,
    roles: []
  },
  {
    path: "/500",
    component: Page500,
    roles: []
  },
  {
    path: "/quan-tri-ket-noi/don-vi/:id",
    component: ChiTietDonVi,
    roles: []
  },
  {
    path: "/info-donvi/:id",
    component: XemDonVi,
    roles: []
  },
  {
    path: "/quan-tri-ket-noi/don-vi",
    component: DanhSachDonVi,
    roles: []
  },
  // {
  //   path: "/danh-muc-dtdc/linh-vuc/:id",
  //   component: ChiTietLinhVuc,
  //   roles: []
  // },
  // {
  //   path: "/danh-muc-dtdc/linh-vuc",
  //   component: DanhSachLinhVuc,
  //   roles: []
  // },
  // {
  //   path: "/danh-muc-dtdc/nhom-danh-muc/:id",
  //   component: ChiTietNhomDanhMuc,
  //   roles: []
  // },
  // {
  //   path: "/danh-muc-dtdc/nhom-danh-muc",
  //   component: DanhSachNhomDanhMuc,
  //   roles: []
  // },
  //QUAN TRI
  {
    path: "/phan-quyen/nhom-quyen/:id",
    component: ChiTietNhomQuyen,
    roles: []
  },
  {
    path: "/phan-quyen/nhom-quyen",
    component: DanhSachNhomQuyen,
    roles: []
  },
  {
    path: "/quan-ly/nguoi-dung/:id",
    component: ChiTietNguoiDung,
    roles: []
  },
  {
    path: "/quan-ly/nguoi-dung",
    component: DanhSachNguoiDung,
    roles: []
  },
  {
    path: "/quan-tri/danh-muc-ung-dung/:id",
    component: ChiTietDanhMuc,
    roles: []
  },
  {
    path: "/quan-tri/danh-muc-ung-dung",
    component: DanhSachDanhMuc,
    roles: []
  },
  {
    path: "/quan-tri/menu/:id",
    component: ChiTietMeNu,
    roles: []
  },
  {
    path: "/quan-tri/menu",
    component: DanhSachMenu,
    roles: []
  },
  {
    path: "/phan-quyen/phan-quyen",
    component: PhanQuyen,
    roles: []
  },
  // {
  //   path: "/danh-muc-dtdc/thuoc-tinh-danh-muc/:id",
  //   component: ChiTietThuocTinhDanhMuc,
  //   roles: []
  // },
  // {
  //   path: "/danh-muc-dtdc/thuoc-tinh-danh-muc",
  //   component: DanhSachThuocTinhDanhMuc,
  //   roles: []
  // },
  {
    path: "/quan-tri/log-api/:id",
    component: ChiTietLogApi,
    roles: []
  },
  {
    path: "/quan-tri/log-api",
    component: DanhSachLogApi,
    roles: []
  },
  {
    path: "/dong-gop-y-kien",
    component: DongGopYKien,
    roles: []
  },
  {
    path: "/quan-ly-y-kien/y-kien/:id",
    component: ChiTietDongGopYKien,
    roles: []
  },
  {
    path: "/quan-ly-y-kien/y-kien",
    component: DanhSachDongGopYKien,
    roles: []
  },
  // {
  //   path: "/danh-muc-dtdc/danh-muc/:id",
  //   component: ChiTietQLDanhMuc,
  //   roles: []
  // },
  // {
  //   path: "/danh-muc-dtdc/danh-muc",
  //   component: DanhSachQLDanhMuc,
  //   roles: []
  // },
  // {
  //   path: "/quoc-gia/nhom-danh-muc",
  //   component: DanhSachNhomDMQuocGia,
  //   roles: []
  // },
  // {
  //   path: "/quoc-gia/danh-muc/:id",
  //   component: ChiTietDMQuocGia,
  //   roles: []
  // },
  // {
  //   path: "/quoc-gia/import",
  //   component: ImportDMDCQG,
  //   roles: []
  // },
  // {
  //   path: "/quoc-gia/lich-su/:id",
  //   component: LichSuDMDCQGChiTiet,
  //   roles: []
  // },
  // {
  //   path: "/quoc-gia/lich-su",
  //   component: LichSuDMDCQG,
  //   roles: []
  // },
  //DICH VU CONG
  {
    path: "/tong-quan/danh-sach-giao-dich",
    component: DanhSachGiaoDich,
    roles: []
  },
  {
    path: "/tong-quan/thong-ke-giao-dich",
    component: ThongKeGiaoDich,
    roles: []
  },
  {
    path: "/tong-quan/thong-tin-ket-noi",
    component: ThongTinKetNoi,
    roles: []
  },
  // {
  //   path: "/tong-quan/thong-tin-dang-nhap",
  //   component: ThongTinDangNhap,
  //   roles: []
  // },
  {
    path: "/dich-vu-cung-cap/:id",
    component: DichVuCungCapChiTiet,
    roles: []
  },
  {
    path: "/info-dvcc/:id",
    component: DichVuCungCapXem,
    roles: []
  },
  {
    path: "/dich-vu-cung-cap",
    component: DichVuCungCap,
    roles: []
  },
  {
    path: "/quan-tri-ket-noi/ung-dung-ket-noi/:id",
    component: ChiTietQuanTriKetNoi,
    roles: []
  },
  {
    path: "/quan-tri-ket-noi/chinh-sua-qtkn/:id",
    component: ChinhSuaQuanTriKetNoi,
    roles: []
  },
  {
    path: "/quan-tri-ket-noi/ung-dung-ket-noi",
    component: QuanTriKetNoi,
    roles: []
  },
  {
    path: "/quan-tri-ket-noi/cau-hinh-ket-noi/:id",
    component: ChiTietCauHinhKetNoi,
    roles: []
  },
  {
    path: "/info-chkn/:id",
    component: XemCauHinhKetNoi,
    roles: []
  },
  {
    path: "/quan-tri-ket-noi/cau-hinh-ket-noi",
    component: CauHinhKetNoi,
    roles: []
  },
  {
    path: "/giam-sat-giao-dich/:id",
    component: ChitietGiamSatGiaoDich,
    roles: []
  },
  {
    path: "/giam-sat-giao-dich",
    component: GiamSatGiaoDich,
    roles: []
  },
  {
    path: "/quan-tri/cau-hinh-he-thong/:id",
    component: ChiTietCauHinhHeThong,
    roles: []
  },
  {
    path: "/quan-tri/cau-hinh-he-thong",
    component: DanhSachCauHinhHeThong,
    roles: []
  },
  { redirect: true, path: "*", to: "/home", navbarName: "Redirect" }
];

export default dashboardRoutes;
