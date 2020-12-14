import React, { Component } from "react";
import ReactDOM from 'react-dom'
import { connect } from "react-redux";
import { isEmpty } from "../../../../../common/ulti/commonFunction";
import { Link } from "react-router-dom";
import * as cmFunction from 'common/ulti/commonFunction'
import * as CONSTANTS from 'common/ulti/constants'
import { GUEST } from "../../../../../common/ulti/constants";

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
    let { General, location } = this.props
    if (General !== prevProps.General) {

    }
    if (location !== prevProps.location) {

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
    let MaQuyenHienThi = item.Ma ?  item.Ma.map(qht => { return qht.Ma }) : []
    let checkKichHoat = item.KichHoat
    let checkActive = item.isActive
    let checkQuyenHienThi = cmFunction.findCommonElements2(MaQuyenHienThi, [GUEST])
    return (checkKichHoat && checkQuyenHienThi && checkActive)
  }

  _handleBuildTreeMenu = (array, target, level) => {
    if (!array.length) return null
    let { location } = this.props
    level++
    return (
      <ul className={"navbar-nav mr-auto " + "navbar-nav-level-" + level}>
        {array.map((item, index) => {
          let checkShowMenu = this._checkShowMenu(item) //item.KichHoat
          if (checkShowMenu) {
            let hasChildren = !!(item.children && item.children.length)
            let { children } = item
            let router = location.pathname.split("/")
            let checkActive = location.pathname === item.URL || router.findIndex(x => `/${x}` === item.URL) !== -1
            return (
              <React.Fragment key={index}>
                <li className={(hasChildren ? "nav-item dropdown" : "nav-item")}>
                  <Link className={(hasChildren ? "nav-link dropdown-toggle" : "nav-link") + (checkActive ? " active" : "")}
                    data-toggle={hasChildren ? "dropdown" : undefined}
                    id={target + level}
                    role="button"
                    to={item.URL || "#"}>
                    <i className={`fas ${item.Class.icon}`}></i>
                    &nbsp;&nbsp;
                    {item.Name}
                  </Link>
                  {hasChildren ? <div className="dropdown-menu bg-light" aria-labelledby={target + level}>
                    {this._handleBuildTreeMenu(children, target + index, level)}
                  </div> : null}
                </li>
              </React.Fragment>
            )
          }
        })}
      </ul>
    )


  }
  render() {
    let { menuArr } = this.state
    return (
      <nav className="web-sidenav navbar navbar-expand-lg navbar-light bg-light">
        <div className='container web-sidenav-container'>
          {/* <Link className="navbar-brand" to="/">
            <i className="fas fa-home color-white"></i>
          </Link> */}
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <i className="fas fa-bars color-white"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {this._handleBuildTreeMenu(menuArr, 'collapseLayouts', 0)}
          </div>
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
