import React from "react";
import Footer from "../../navigation/layouts/Admin/Footer/index.jsx";
import { goBack } from "../../../common/ulti/commonFunction.js";

function Page404({ ...props }) {
  return (
    <div id="layoutError">
      <div id="layoutError_content">
        <main>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="text-center mt-4">
                  <img className="mb-4 img-error" src="common/assets/imgs/404-monochrome.svg" />
                  <p className="lead">Yêu cầu này không được tìm thấy.</p>
                  <button className='link' onClick={goBack}><i className="fas fa-arrow-left mr-1"></i>Quay trở lại</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* <div id="layoutError_footer">
        <Footer />
      </div> */}
    </div>
  )
}

export default Page404;
