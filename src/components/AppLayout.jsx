import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useEffect, useState } from "react";
import { getCurrentProfile } from "../services/profileService";

function AppLayout({ children }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
      useEffect(() => {
      async function loadProfile() {
        const profile = await getCurrentProfile();
        setRole(profile?.role);
      }

      loadProfile();
    }, []);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase signOut failed", error);
    }

    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <Link className="brand" to={role === "admin" ? "/admin" : "/dashboard"}>
            HR Task Follow-Up
          </Link>
          <p className="brand-subtitle">Task tracking, follow-up, and calendar management</p>
        </div>

        <nav className="nav-links" aria-label="Primary">
          <NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to={role === "admin" ? "/admin" : "/dashboard"}>
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to={role === "admin" ? "/admin/tasks" : "/tasks"}>
            Tasks
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to={role === "admin" ? "/admin/calendar" : "/calendar"}>
            Calendar
          </NavLink>
        </nav>

        <button className="button button-secondary" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      <main className="page-shell">{children}</main>
    </div>
  );
}

export default AppLayout;
