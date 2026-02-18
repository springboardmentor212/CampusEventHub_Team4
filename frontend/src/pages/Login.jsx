import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    navigate("/student");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🎓</div>

        <h2 className="auth-title">CampusEventHub</h2>
        <p className="auth-subtitle">
          Sign in to manage your campus events
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-box">
              <input
                type="email"
                placeholder="e.g. student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-box">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-row">
            <div>
              <input type="checkbox" /> Remember me
            </div>
            <a href="#">Forgot?</a>
          </div>

          <button className="auth-button" type="submit">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
