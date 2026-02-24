import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeId: "",
    role: "student",
  });
  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const res = await API.get("/colleges");
        if (res.data.success) {
          console.log("Colleges fetched:", res.data.data.colleges);
          setColleges(res.data.data.colleges);
        }
      } catch (err) {
        console.error("Failed to fetch colleges", err);
        setError("Failed to load university list. Please refresh.");
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.collegeId) {
      setError("Please select a college");
      return;
    }

    const nameParts = form.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      firstName,
      lastName,
      collegeId: form.collegeId,
      role: form.role,
    };

    try {
      await API.post("/auth/register", payload);
      alert("Registered Successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] dark:from-gray-950 dark:to-gray-950 min-h-screen font-display text-[#111827] flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-white/10 overflow-hidden">
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#5048e5] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
          </div>
          <h1 className="text-[28px] font-bold text-[#111827] dark:text-white leading-tight">
            Create Account
          </h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-2">
            Join the CampusEventHub community today.
          </p>
        </div>

        {error && (
          <div className="px-6 mb-2 text-center text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="px-6 pb-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  account_circle
                </span>
                <input
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#E5E7EB] focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all outline-none"
                  placeholder="johndoe123"
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  person
                </span>
                <input
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#E5E7EB] focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all outline-none"
                  placeholder="John Doe"
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  mail
                </span>
                <input
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#E5E7EB] focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all outline-none"
                  placeholder="name@university.edu"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
                College / University
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  account_balance
                </span>
                <select
                  required
                  className="w-full h-12 pl-10 pr-10 rounded-lg border border-[#E5E7EB] focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none transition-all outline-none"
                  value={form.collegeId}
                  onChange={(e) =>
                    setForm({ ...form, collegeId: e.target.value })
                  }
                >
                  <option value="">
                    {loadingColleges ? "Loading universities..." : "Select your university"}
                  </option>
                  {!loadingColleges && colleges.length === 0 && (
                    <option value="" disabled>No universities found</option>
                  )}
                  {colleges.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
                Role
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  group
                </span>
                <select
                  className="w-full h-12 pl-10 pr-10 rounded-lg border border-[#E5E7EB] focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none transition-all outline-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="college_admin">College Admin</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  lock
                </span>
                <input
                  required
                  className="w-full h-12 pl-10 pr-10 rounded-lg border border-[#E5E7EB] focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all outline-none"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5048e5] transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  lock_reset
                </span>
                <input
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#E5E7EB] focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all outline-none"
                  placeholder="••••••••"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white font-semibold rounded-lg shadow-lg shadow-[#5048e5]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Create Account
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-[#6B7280] dark:text-gray-400 pt-2">
            Already have an account?{" "}
            <Link
              className="text-[#5048e5] font-semibold hover:underline"
              to="/login"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-center text-[#6B7280] dark:text-gray-500 max-w-xs px-4">
        By creating an account, you agree to our{" "}
        <a className="underline" href="#">
          Terms of Service
        </a>{" "}
        and{" "}
        <a className="underline" href="#">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default Register;
