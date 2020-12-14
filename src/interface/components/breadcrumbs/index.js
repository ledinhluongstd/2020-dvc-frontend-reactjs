import React, { Component } from "react";
import { TEMPLATE } from '../../../../config'
import { Link } from "react-router-dom";

class BreadCrumbs extends Component {
  render() {
    let { title, route } = this.props
    route = route && route.length ? route : [];
    let length = route.length
    return (
      <div className="my-breadcrumbs">
        <ol className="breadcrumb">
        <Link className="breadcrumb-item" to={'/'}>{'Trang chủ'}</Link>
          {route.map((item, index) => {
            if (index < (length - 1))
              return <Link key={index} className="breadcrumb-item" to={item.value}>{item.label}</Link>
            return <li key={index} className="breadcrumb-item active">{item.label}</li>
          })}
        </ol>
      </div>
    );
  }
}

export default BreadCrumbs;
