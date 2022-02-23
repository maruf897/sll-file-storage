import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./AuthUtil";

export function PrivateRoute({ children }) {
  const auth = useAuth();
  return auth.user ? children : <Navigate to="/" />;
}
