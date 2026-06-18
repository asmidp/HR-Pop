import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { getCurrentProfile } from "../services/profileService";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
  event.preventDefault();
  setLoading(true);
  setError("");

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("Supabase email login failed", authError);
    setError("We couldn't sign you in. Please check your email and password.");
    setLoading(false);
    return;
  }

  const profile = await getCurrentProfile();

  console.log("Profile:", profile);
console.log("Role:", profile?.role);

if (profile?.role === "admin") {
  console.log("Navigating to /admin");
  navigate("/admin", { replace: true });
} else {
  console.log("Navigating to /dashboard");
  navigate("/dashboard", { replace: true });
}

  setLoading(false);
}

  return (
    <div className="auth-screen">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">TATA Motors</p>
          <h1>HR Task Follow-Up & Calendar Manager</h1>
          <p className="lead">
            
          </p>
        </div>

        <form className="form-card auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="hr@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

         
          <button className="button button-primary"type="submit"disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
          </button>
          <Link className="button button-secondary button-link" to="/signup">
            Create Account
          </Link>

        </form>
      </section>
    </div>
  );
}

export default Login;
