import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("Registered Successfully!");
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🎓</div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">
          Join the CampusEventHub community today.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-box">
              <input
                type="text"
                placeholder="Enter username"
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>First Name</label>
            <div className="input-box">
              <input
                type="text"
                placeholder="First Name"
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <div className="input-box">
              <input
                type="text"
                placeholder="Last Name"
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-box">
              <input
                type="email"
                placeholder="Enter email"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-box">
              <input
                type="password"
                placeholder="Create password"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          </div>

          <button className="auth-btn" type="submit">
            Sign Up
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
