import { post } from "jquery";

export const data = [
  {
    DonVi: 'Bộ Tổng Tham mưu',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: '/API-traHoSo',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 26/10/2020',
    GiaoDich: 'Thành Công',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong:'',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2:'Send',
      DiaChiDich:'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Bộ Tổng Tham mưu',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: '/API-traDsTrangThaiHs',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 26/10/2020',
    GiaoDich: 'Thành Công',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Tổng cục Chính trị',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: '/API-danhDauHsThanhCong',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 02/10/2020',
    GiaoDich: 'Thành Công',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Tổng cục Kỹ thuật',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: '/dsHoSoDangKy',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 25/09/2020',
    GiaoDich: 'Thất Bại',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Tổng cục Hậu cần',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: '/API-traDanhMuc',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 20/09/2020',
    GiaoDich: 'Thành Công',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Tổng cục Hậu cần',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: '/API-traDsTrangThaiHs',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 20/09/2020',
    GiaoDich: 'Thành Công',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Tổng cục Công nghiệp Quốc phòng',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: 'API-traDanhMuc',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 20/09/2020',
    GiaoDich: 'Thành Công',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Tổng cục Công nghiệp Quốc phòng',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: 'API-traDanhMuc',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 19/09/2020',
    GiaoDich: 'Thất bại',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Cục Kế hoạch và Đầu tư',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: '/API-traDsTrangThaiHs',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 19/09/2020',
    GiaoDich: 'Thành Công',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
  {
    DonVi: 'Cục Kế hoạch và Đầu tư',
    Email: 'nguyenvana@bqp.gov.vn',
    TacVu: 'API-traHoSo',
    DichVu: 'NGSP-LLTP',
    URL: 'https://api.bqp.gov.vn/NGSP-LLTP/1.0',
    NgayGiaoDich: '15:33 19/09/2020',
    GiaoDich: 'Thành Công',
    CHiTiet: {
      HeThong: 'Chính Thức',
      UngDung: 'Một cửa điện tử',
      PhuongThuc: 'POST',
      IP: '10.255.21.23',
      MoiTruong: '',
      Mediator1: 'NGSP-LLTP-Prod',
      Mediator2: 'Send',
      DiaChiDich: 'https://10.255.21.23:8280/services/NGSP-LLTP-Prod',
      ThoiGianTraVe: '266348'
    }
  },
]