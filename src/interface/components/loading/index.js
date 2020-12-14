import React, { Component } from "react";
import { connect } from "react-redux";

class SpinnerComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  
  render() {
    if (!this.props.Wait)
      return null
    return (
      <div className="div-spinner ">
        <div className="div-fas-spinner">
          <i className="fas fa-spinner fa-pulse fa-3x"></i>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  let { LoginRes, Wait } = state;
  return { LoginRes, Wait };
};
export default connect(mapStateToProps)(SpinnerComponent);
