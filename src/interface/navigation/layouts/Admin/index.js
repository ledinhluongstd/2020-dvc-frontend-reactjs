import React from "react";
import { connect } from "react-redux";
import { Switch, Route, Redirect } from "react-router-dom";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import Header from "./Header/index.jsx";
import Footer from "./Footer/index.jsx";
import Sidebar from "./Sidebar/index.jsx";
import { LoadingComponent, ToastNotify } from 'interface/components'
import dashboardRoutes from "../nav";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allDone: false,
      dashboardRoutes: []
    }
  }

  componentDidUpdate(prevProps) {
    let { General } = this.props
    if (General !== prevProps.General) {
      this.state.allDone = true
      this.forceUpdate()
    }
  }

  switchRoutes = ()=>{
    let {General} = this.props
    return (
      <Switch>
        {dashboardRoutes.map((prop, key) => {
          if (prop.redirect)
            return <Redirect from={prop.path} to={prop.to} key={key} />;
          return <Route path={prop.path} component={prop.component} key={key} />;
        })}
      </Switch>
    )
  };

  render() {
    const { classes, ...rest } = this.props;
    let { allDone } = this.state
    if (!allDone) {
      return (
        <LoadingComponent />
      )
    }
    return (
      <React.Fragment>
        <Header />
        <div id="layoutSidenav">
          <div id="layoutSidenav_nav" >
            <Sidebar location={this.props.location} />
          </div>
          <div id="layoutSidenav_content">
            <main>
              {this.switchRoutes()}
            </main>
            <Footer />
          </div>
        </div>
        <ToastNotify />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  let { LoginRes, General, ToastNotify } = state;
  return { LoginRes, General, ToastNotify };
};
export default connect(mapStateToProps)(App);
