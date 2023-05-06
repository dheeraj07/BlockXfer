import React, { Component } from "react";
import { useLocation, Route, Switch, Redirect } from "react-router-dom";
import AdminNavbar from "./components/Navbars/AdminNavbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { RequireAuth } from "./components/RequireAuth";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/blockxfer-main.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import routes from "./routes.js";
import sidebarImage from "./assets/img/eth.jpeg";

function App() {
  const [image, setImage] = React.useState(sidebarImage);
  const [color, setColor] = React.useState("black");
  const [hasImage, setHasImage] = React.useState(true);
  const location = useLocation();
  const mainPanel = React.useRef(null);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      return (
        <Route path={prop.layout + prop.path} key={key}>
          {prop.path.includes("login") || prop.redirect ? (
            <prop.component />
          ) : (
            <RequireAuth>
              <prop.component />
            </RequireAuth>
          )}
        </Route>
      );
    });
  };

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      var element = document.getElementById("bodyClick");
      element.parentNode.removeChild(element);
    }
    <Redirect to="/app/dashboard" />;
  }, [location]);
  return (
    <>
      <div className="wrapper">
        <Sidebar color={color} image={hasImage ? image : ""} routes={routes} />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar />
          <div className="content">
            <Switch>{getRoutes(routes)}</Switch>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
