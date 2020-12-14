import Admin from "./layouts/Admin";
import Web from "./layouts/Web";
import Auth from "./layouts/Auth";

const indexRoutes = {
  'auth': { path: "/", component: Auth },
  'admin': { path: "/", component: Admin },
  'web': { path: "/", component: Web },
};

export default indexRoutes;
