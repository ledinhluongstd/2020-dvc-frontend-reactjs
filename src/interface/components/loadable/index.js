import React from "react";

function LoadingComponent({ ...props }) {
  return (
    <div className="div-loadable ">
      <div className="div-fas-spinner">
        <p>Đang tải dữ liệu ...</p>
      </div>
    </div>
  );
}

export default LoadingComponent;
