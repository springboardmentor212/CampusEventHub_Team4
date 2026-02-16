import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <br />

        <input
          placeholder="First Name"
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        <br />

        <input
          placeholder="Last Name"
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
        <br />

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <br />

        <select
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="college_admin">College Admin</option>
        </select>
        <br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
