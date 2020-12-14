import React, { Component } from "react";
import ReactDOM from 'react-dom'
import { connect } from "react-redux";
import { isEmpty } from "../../../../../common/ulti/commonFunction";
import { Link } from "react-router-dom";
import * as cmFunction from 'common/ulti/commonFunction'
import * as CONSTANTS from 'common/ulti/constants'

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuArr: []
    }
  }

  componentDidMount() {
    let { General } = this.props
    let { Menu } = General
    this.state.menuArr = this._handleConvertTreeMenu(Menu)
    this.forceUpdate()
  }

  componentDidUpdate(prevProps) {
    let { General } = this.props
    if (General !== prevProps.General) {

    }
  }

  _handleConvertTreeMenu = (list) => {
    if (isEmpty(list)) return [];
    list.sort(cmFunction.compare);
    let map = {}, roots = [];

    list.map((item, ind) => {
      map[item.Id] = ind;
      item.children = [];
    })

    list.map((item, ind) => {
      if (!!item.Parent_Id) {
        list[map[item.Parent_Id.Id || item.Parent_Id]].children.push(item);
      } else {
        roots.push(item);
      }
    })

    return roots;
  }

  _checkShowMenu = (item) => {
    let { LoginRes } = this.props
    let { roles } = LoginRes
    if (!roles) return false
    if (roles === CONSTANTS.SUPER.roles) {
      return true
    } else {
      if (!item.Ma) return false
      let MaQuyen = roles.Ma
      let MaQuyenHienThi = item.Ma.map(qht => { return qht.Ma })
      let checkKichHoat = item.KichHoat
      let checkActive = item.isActive
      let checkQuyenHienThi = cmFunction.findCommonElements2(MaQuyenHienThi, MaQuyen)
      return (checkKichHoat && checkQuyenHienThi && checkActive)
    }
  }

  _handleBuildTreeMenu = (array, target, level) => {
    if (!array.length) return null
    let { location } = this.props
    level++
    return (
      <div className="nav">
        {array.map((item, index) => {
          let checkShowMenu = this._checkShowMenu(item) //item.KichHoat
          if (checkShowMenu) {
            let hasChildren = !!(item.children && item.children.length)
            let { children } = item
            let router = location.pathname.split("/")
            let checkActive = location.pathname === item.URL || router.findIndex(x => `/${x}` === item.URL) !== -1
            return (
              <React.Fragment key={index}>
                <Link to={item.URL || "#"} className={(hasChildren ? "nav-link collapsed" : "nav-link") + (checkActive ? " active" : "")}
                  data-toggle={hasChildren ? "collapse" : undefined}
                  data-target={hasChildren ? ("#" + target + index) : undefined}
                  aria-expanded={hasChildren ? "false" : undefined}
                  aria-controls={hasChildren ? (target + index) : undefined}
                >
                  <div className="sb-nav-link-icon">
                    <i className={`fas ${item.Class.icon}`}></i>
                  </div>
                  {item.Name}
                  {hasChildren ? <div className="sb-sidenav-collapse-arrow">
                    <i className="fas fa-angle-down"></i>
                  </div> : null}
                </Link>
                {hasChildren ? <div className={`collapse margin-left-${level}x`} id={target + index} aria-labelledby="headingOne">
                  {this._handleBuildTreeMenu(children, target + index, level)}
                </div> : null}
              </React.Fragment>
            )
          }
        })}
      </div>
    )
  }

  render() {
    let { menuArr } = this.state
    return (
      <nav className="sb-sidenav accordion bg-light" id="sidenavAccordion" >
        <div className="sb-sidenav-menu">
          {this._handleBuildTreeMenu(menuArr, 'collapseLayouts', 0)}
        </div>
        <div className="sb-sidenav-footer">
          <div className="small">MiTC</div>
        </div>
      </nav>
    )
  }
}

const mapStateToProps = state => {
  let { LoginRes, General } = state;
  return { LoginRes, General };
};
export default connect(mapStateToProps)(Sidebar);
