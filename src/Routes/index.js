import {
  Routes as Router,
  Route
} from "react-router-dom";
import Search from "./Search";
import Home from "./Home";
import Stop from "./Stop";
import Bus from "./Bus";
import RouteComponent from "./Route";

export default function Routes() {
  return (
    <Router>
      <Route path="/" element={<Home />} />
      <Route path="search" element={<Search />} />
      <Route path="stop/:id/*" element={<Stop />} />
      <Route path="bus/:busId" element={<Bus />} />
      <Route path="route/:routeId" element={<RouteComponent />} />
    </Router>
  )
}
