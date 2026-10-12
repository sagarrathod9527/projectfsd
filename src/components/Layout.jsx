import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">LeaveFlow</div>

        <nav className="nav-menu">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/apply-leave">Apply Leave</NavLink>
          {user?.role !== "employee" && (
            <NavLink to="/manager-approvals">Approvals</NavLink>
          )}
        </nav>

        <div className="profile-box">
          <strong>{user?.name || "Employee"}</strong>
          <span>{user?.role || "User"}</span>
          <button onClick={handleLogout} className="secondary-btn">Logout</button>
        </div>
      </aside>

      <main className="content-area">{children}</main>
    </div>
  );
};

export default Layout;
