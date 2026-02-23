import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Determine redirection based on role from AuthContext if needed
      // Existing code just went to /student
      navigate("/student");
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="font-display bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] dark:from-gray-950 dark:to-gray-950 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        <div className="pt-10 pb-6 px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#5048e5]/10 rounded-xl flex items-center justify-center text-[#5048e5]">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
          </div>

          <h1 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">
            CampusEventHub
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Sign in to manage your campus events
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 dark:text-gray-200"
            >
              Email Address
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. student@university.edu"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500/60 focus:ring-[#5048e5] focus:border-[#5048e5] text-sm transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#5048e5] hover:text-[#5048e5]/80 transition-colors"
              >
                Forgot?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <span className="material-symbols-outlined text-xl">lock</span>
              </div>

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500/60 focus:ring-[#5048e5] focus:border-[#5048e5] text-sm transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#5048e5] focus:ring-[#5048e5] border-gray-200 dark:border-gray-700 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-500 dark:text-gray-400"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5048e5] transition-all active:scale-[0.98]"
          >
            Sign In
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-[#5048e5] hover:underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-[#5048e5]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;
