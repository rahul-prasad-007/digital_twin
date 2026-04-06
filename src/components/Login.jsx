import { useState } from "react";
import "./Login.css";

export default function Login({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (mode === "login") {
      const username = form.user.value.trim();
      const password = form.pass.value;
      if (username === "admin" && password === "1234") {
        onSuccess();
      } else {
        setStatus("Invalid login credentials. Please try again.");
      }
      return;
    }

    const username = form.user.value.trim();
    const email = form.email.value.trim();
    const password = form.pass.value;
    const confirm = form.confirm.value;

    if (!username || !email || !password || !confirm) {
      setStatus("Please complete all signup fields.");
      return;
    }
    if (password !== confirm) {
      setStatus("Passwords do not match. Please check and try again.");
      return;
    }

    setStatus("Account created successfully. Please login with your new credentials.");
    setMode("login");
    form.reset();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="glow-ring" />
        <div className="auth-inner">
          <h2 className="auth-heading">
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Sign in to continue to the digital twin dashboard."
              : "Join now and start exploring the lavender-powered sign up flow."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input className="auth-input" type="text" name="user" placeholder="Username" />
            {mode === "signup" && (
              <input className="auth-input" type="email" name="email" placeholder="Email address" />
            )}
            <input className="auth-input" type="password" name="pass" placeholder="Password" />
            {mode === "signup" && (
              <input className="auth-input" type="password" name="confirm" placeholder="Confirm password" />
            )}
            <button className="auth-button" type="submit">
              {mode === "login" ? "Login" : "Sign Up"}
            </button>
          </form>

          <div className="auth-toggle">
            {mode === "login" ? (
              <>
                <span>New here?</span>
                <button type="button" onClick={() => { setMode("signup"); setStatus(""); }}>
                  Create account
                </button>
              </>
            ) : (
              <>
                <span>Already registered?</span>
                <button type="button" onClick={() => { setMode("login"); setStatus(""); }}>
                  Sign in
                </button>
              </>
            )}
          </div>

          {status && <div className="auth-status">{status}</div>}
          <div className="auth-footer">
            Lavender theme with soft glow visuals for a calm sign-in experience.
          </div>
        </div>
      </div>
    </div>
  );
}
