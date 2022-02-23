import logo from "./logo.svg";
import "./App.css";

import { TestS3 } from "./Components/TestS3";

import LoginForm from "./Components/LoginForm";
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
import { PrivateRoute } from "./Auth/PrivateRoute";
import { AuthProvider } from "./Auth/AuthUtil";
function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginForm />} />

            <Route
              path="/app"
              element={
                <PrivateRoute>
                  <TestS3 />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
