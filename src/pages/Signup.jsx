import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createEmployee } from "../services/employeeService";
import { supabase } from "../services/supabase";

const EMPTY_SIGNUP_FORM = {
  name: "",
  email: "",
  password: "",
  department: "",
  role: "",
  joining_date: "",
};

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_SIGNUP_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          department: form.department || null,
          role: form.role || null,
          joining_date: form.joining_date || null,
        },
      },
    });

    if (authError) {
      console.error("Supabase signup failed", authError);
      setError("We couldn't create the account. Please check the details and try again.");
      setLoading(false);
      return;
    }

    const { error: employeeError, friendlyMessage } = await createEmployee(form);

    if (employeeError) {
      setError(friendlyMessage);
      setLoading(false);
      return;
    }

    setNotice("Account created. You can now sign in.");
    setForm(EMPTY_SIGNUP_FORM);
    setLoading(false);

    window.setTimeout(() => {
      navigate("/login");
    }, 1200);
  }

  return (
    <div className="auth-screen">
      <section className="auth-panel signup-panel">
        <div>
          <p className="eyebrow">Create Account</p>
          <h1>Join TM-HR-Pulse</h1>
          <p className="lead">Create your login and save your employee details in Supabase.</p>
        </div>

        <form className="form-card auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              className="input"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Full name"
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              placeholder="hr@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => updateForm("password", event.target.value)}
              placeholder="Create a password"
              minLength="6"
              required
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Department</span>
              <input
                className="input"
                value={form.department}
                onChange={(event) => updateForm("department", event.target.value)}
                placeholder="HR"
              />
            </label>

            <label className="field">
              <span>Role</span>
              <input
                className="input"
                value={form.role}
                onChange={(event) => updateForm("role", event.target.value)}
                placeholder="Manager"
              />
            </label>
          </div>

          <label className="field">
            <span>Joining Date</span>
            <input
              className="input"
              type="date"
              value={form.joining_date}
              onChange={(event) => updateForm("joining_date", event.target.value)}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {notice ? <p className="success-text">{notice}</p> : null}

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <Link className="button button-secondary button-link" to="/login">
            Back to sign in
          </Link>
        </form>
      </section>
    </div>
  );
}

export default Signup;
