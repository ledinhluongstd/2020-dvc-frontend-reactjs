import React from "react";
import Footer from "../../navigation/layouts/Admin/Footer/index.jsx";
import { goBack } from "../../../common/ulti/commonFunction.js";

function Other({ ...props }) {
  return (
    <div id="layoutError">
      <div id="layoutError_content">
        <main>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="text-center mt-4">
                  {/* <img className="mb-4 img-error" src="common/assets/imgs/404-monochrome.svg" /> */}
                  <p className="lead">Có lỗi hiển thị vui lòng kiểm tra lại thông tin.</p>
                  <button className='link' onClick={goBack}><i className="fas fa-arrow-left mr-1"></i>Quay trở lại</button>
                  <p>{JSON.stringify(props.data.message || props.data)}</p>
                  <p>{JSON.stringify(props.data.stack || props.data)}</p>
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

export default Other;
