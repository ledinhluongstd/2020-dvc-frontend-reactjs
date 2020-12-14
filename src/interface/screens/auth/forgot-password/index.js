import React from "react";
import { Link } from "react-router-dom";

import Footer from "../../../navigation/layouts/Admin/Footer/index.jsx";

function ForgotPassword({ ...props }) {
  return (
    <div id="layoutAuthentication">
      <div id="layoutAuthentication_content">
        <main>
          <div className="container auth">
            <div className="row justify-content-center">
              <div className="col-lg-5">
                <div className="card shadow-lg border-0 rounded-lg mt-5">
                  <div className="card-header"><h3 className="text-center font-weight-light my-4">Khôi phục mật khẩu</h3></div>
                  <div className="card-body">
                    <div className="mb-3 text-muted">Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu của bạn.</div>
                    <div className="form-group"><label className="mb-1" htmlFor="inputEmailAddress">Email</label>
                      <input className="form-control py-4" id="inputEmailAddress" type="email" aria-describedby="emailHelp"
                        placeholder="Nhập địa chỉ email" />
                    </div>
                    <div className="form-group d-flex align-items-center justify-content-between mt-4 mb-0">
                      <Link to={'/login'}>
                        Đăng nhập
                        </Link>
                      <button className="btn btn-primary">Đặt lại mật khẩu</button>
                    </div>
                  </div>
                  <div className="card-footer text-center">
                    <div className="">
                      <Link to={'/register'}>
                        Chưa có tài khoản? Đăng ký ngay!
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* <div id="layoutAuthentication_footer">
        <Footer />
      </div> */}
    </div>
  )
}

export default ForgotPassword;
