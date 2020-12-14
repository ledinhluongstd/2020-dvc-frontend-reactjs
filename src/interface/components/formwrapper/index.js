import React, { Component } from "react";

class FormWrapper extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="form-row form-group form-custom form-wrap">
        {this.props.children}
      </div>
    );
  }
}

export default FormWrapper