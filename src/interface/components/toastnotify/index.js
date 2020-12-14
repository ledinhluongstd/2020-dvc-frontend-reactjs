import React, { Component } from "react";
import { ToastContainer, toast } from 'react-toastify';

class ToastNotify extends Component {
  render() {
    return (
      <ToastContainer position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover />
    );
  }
}

export default ToastNotify;
