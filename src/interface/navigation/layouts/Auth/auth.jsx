
import React from 'react';
// @material-ui/icons
import { Dashboard, Warning } from "@material-ui/icons";

//loadable
import loadable from 'react-loadable';
import { LoadingComponent } from 'interface/components'

const Home = loadable({ loader: () => import('interface/screens/auth/home'), loading: LoadingComponent });
const Danhsach = loadable({ loader: () => import('interface/screens/auth/danhsach/danhsach'), loading: LoadingComponent });
// const Chitiet = loadable({ loader: () => import('interface/screens/auth/danhsach/chitiet'), loading: LoadingComponent });
const DongGopYKien = loadable({ loader: () => import('interface/screens/donggopykien/index'), loading: LoadingComponent });
const TrichXuat = loadable({ loader: () => import('interface/screens/auth/trichxuat/trichxuat.bqp'), loading: LoadingComponent });
// const TrichXuat = loadable({ loader: () => import('interface/screens/auth/trichxuat/trichxuat.tinh'), loading: LoadingComponent });
const TimKiemChiTiet = loadable({ loader: () => import('interface/screens/auth/timkiemchitiet/index.bqp'), loading: LoadingComponent });
// const TimKiemChiTiet = loadable({ loader: () => import('interface/screens/auth/timkiemchitiet/index.tinh'), loading: LoadingComponent });
const DanhMucQuocGia = loadable({ loader: () => import('interface/screens/auth/timkiemchitiet/danhmuc.bqp'), loading: LoadingComponent });
// const DanhMucQuocGia = loadable({ loader: () => import('interface/screens/auth/timkiemchitiet/danhmuc.tinh'), loading: LoadingComponent });
const ForgotPassword = loadable({ loader: () => import('interface/screens/auth/forgot-password'), loading: LoadingComponent });
const Login = loadable({ loader: () => import('interface/screens/auth/login'), loading: LoadingComponent });
const Register = loadable({ loader: () => import('interface/screens/auth/register'), loading: LoadingComponent });

const Page401 = loadable({ loader: () => import('interface/screens/error/401'), loading: LoadingComponent });
const Page404 = loadable({ loader: () => import('interface/screens/error/404'), loading: LoadingComponent });
const Page500 = loadable({ loader: () => import('interface/screens/error/500'), loading: LoadingComponent });

const authRoutes = [
  // {
  //   path: "/chitiet/:id",
  //   sidebarName: "Chitiet",
  //   navbarName: "Material Dashboard",
  //   icon: Dashboard,
  //   component: Chitiet
  // },
  // {
  //   path: "/home/:id",
  //   sidebarName: "Danhsach",
  //   navbarName: "Material Dashboard",
  //   icon: Dashboard,
  //   component: Danhsach
  // },
  // {
  //   path: "/home",
  //   sidebarName: "Home",
  //   navbarName: "Material Dashboard",
  //   icon: Dashboard,
  //   component: Home
  // },
  {
    path: "/login",
    sidebarName: "Login",
    navbarName: "Material Dashboard",
    icon: Dashboard,
    component: Login
  },
  {
    path: "/register",
    sidebarName: "Register",
    navbarName: "Material Dashboard",
    icon: Dashboard,
    component: Register
  },
  {
    path: "/forgot-password",
    sidebarName: "ForgotPassword",
    navbarName: "Material Dashboard",
    icon: Dashboard,
    component: ForgotPassword
  },
  {
    path: "/401",
    sidebarName: "401",
    navbarName: "401",
    icon: Warning,
    component: Page401
  },
  {
    path: "/404",
    sidebarName: "404",
    navbarName: "404",
    icon: Warning,
    component: Page404
  },
  {
    path: "/500",
    sidebarName: "500",
    navbarName: "500",
    icon: Warning,
    component: Page500
  },
  {
    path: "/dong-gop-y-kien",
    sidebarName: "Đóng góp ý kiến",
    navbarName: "Đóng góp ý kiến",
    icon: Warning,
    component: DongGopYKien
  }, 
  {
    path: "/search/danh-muc/:id",
    sidebarName: "Danh mục Quốc Gia",
    navbarName: "Danh mục Quốc Gia",
    icon: Warning,
    component: DanhMucQuocGia
  },
  {
    path: "/search",
    sidebarName: "Tìm kiếm Chi Tiết",
    navbarName: "Tìm kiếm Chi Tiết",
    icon: Warning,
    component: TimKiemChiTiet
  },
  {
    path: "/trich-xuat-du-lieu",
    sidebarName: "Trích xuất dữ liệu",
    navbarName: "Trích xuất dữ liệu",
    icon: Warning,
    component: TrichXuat
  },
  //DEMO
  {
    path: "/danh-sach-demo/:id",
    sidebarName: "500",
    navbarName: "500",
    icon: Warning,
    component: Page500
  },
  {
    path: "/danh-sach-demo",
    sidebarName: "500",
    navbarName: "500",
    icon: Warning,
    component: Page500
  },

  { redirect: true, path: "*", to: "/login", navbarName: "Redirect" }
];

export default authRoutes;
