/* eslint-disable */
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// import { toast } from 'react-toastify';
// import * as cmFunction from 'common/ulti/commonFunction'
import Header from "./Header/index.jsx";
import Footer from "./Footer/index.jsx";
import Sidebar from "./Sidebar/index.jsx";

import authRoutes from "./auth.jsx";
import { ToastNotify } from 'interface/components'
import { LoadingComponent, SpinnerComponent } from "../../../components/index.js";

const switchRoutes = (
  <Switch>
    {authRoutes.map((prop, key) => {
      if (prop.redirect)
        return <Redirect from={prop.path} to={prop.to} key={key} />;
      return <Route path={prop.path} component={prop.component} key={key} />;
    })}
  </Switch>
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allDone: false
    }
  }

  componentDidUpdate(prevProps) {
    let { General } = this.props
    if (General !== prevProps.General) {
      this.state.allDone = true
      this.forceUpdate()
    }
  }

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
        <Sidebar location={this.props.location} />
        <main className='web-layout'>
          <div className='container web-layout-container'>
            {switchRoutes}
          </div>
        </main>
        <Footer />
        <ToastNotify />
        <SpinnerComponent />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  let { ToastNotify, General } = state;
  return { ToastNotify, General };
};
export default connect(mapStateToProps)(App);
