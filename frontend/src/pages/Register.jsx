import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import FormInput from "../components/FormInput";
import {
  User,
  Mail,
  ShieldCheck,
  MailCheck,
  AlertTriangle,
  ChevronDown,
  Lock,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    collegeId: "",
    customCollegeName: "",
    role: "student",
    officialId: "",
    academicClass: "",
    section: ""
  });
  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [collegeError, setCollegeError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/superadmin");
      else if (user.role === "college_admin") navigate("/admin");
      else navigate("/campus-feed");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const res = await API.get("/colleges");
        if (res.data.success) setColleges(res.data.data.colleges);
      } catch (err) {
        toast.error("Failed to load university list");
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  const handleCollegeSelect = async (college) => {
    if (college === "custom") {
      setForm({ ...form, collegeId: "custom" });
      setCollegeSearchTerm("My college is not listed");
      setShowCollegeDropdown(false);
      setCollegeError("");
      return;
    }

    setForm({ ...form, collegeId: college._id, customCollegeName: "" });
    setCollegeSearchTerm(college.name);
    setShowCollegeDropdown(false);
    setCollegeError("");
  };

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(collegeSearchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!form.collegeId) {
      toast.error("Please select your college");
      return;
    }
    if (form.collegeId === "custom" && !form.customCollegeName.trim()) {
      toast.error("Please provide your college name");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating your account...");
    const nameParts = form.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      firstName,
      lastName,
      phone: form.phone,
      role: form.role,
      officialId: form.officialId,
      academicClass: form.academicClass,
      section: form.section,
    };

    if (form.collegeId === "custom") {
      payload.customCollegeName = form.customCollegeName;
    } else {
      payload.collegeId = form.collegeId;
    }

    try {
      const res = await API.post("/auth/register", payload);
      toast.success("Registration successful!", { id: loadingToast });
      setRegisteredEmail(form.email);
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData?.message || "Registration failed";

      if (msg.toLowerCase().includes("email")) setFieldErrors(prev => ({ ...prev, email: msg }));
      else if (msg.toLowerCase().includes("username")) setFieldErrors(prev => ({ ...prev, username: msg }));
      else if (msg.toLowerCase().includes("phone")) setFieldErrors(prev => ({ ...prev, phone: msg }));
      else if (msg.toLowerCase().includes("id")) setFieldErrors(prev => ({ ...prev, officialId: msg }));

      toast.error(msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredEmail) {
    const isCollegeAdmin = form.role === "college_admin";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-fade-in text-slate-900">
        <div className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 max-w-xl w-full shadow-2xl shadow-indigo-100/50 text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-10 border border-indigo-100">
            <MailCheck className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black mb-6 italic tracking-tight">Check Your Email</h1>
          <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">
            We sent a confirmation link to <br />
            <span className="font-bold text-slate-900">{registeredEmail}</span>
          </p>

          <div className="bg-slate-50 rounded-[2rem] p-8 mb-10 text-left border border-slate-100">
            <div className="space-y-6">
              <div className="flex gap-5">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                <p className="text-sm font-bold text-slate-700">Search for "CampusEventHub" in your inbox</p>
              </div>
              <div className="flex gap-5">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                <p className="text-sm font-bold text-slate-700">Click the confirmation link</p>
              </div>
              <div className="flex gap-5">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">Wait for your application to be reviewed</p>
              </div>
              <div className="flex gap-5">
                <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0">4</div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">Check your Promotions or Spam folders if it's missing.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 mb-8 text-left border border-amber-100 flex flex-col gap-3">
            <div className="flex gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-amber-900 leading-relaxed uppercase tracking-wide">
                {isCollegeAdmin
                  ? "After confirming, the platform admin will review your application."
                  : "After confirming, your college admin will review your application."}
              </p>
            </div>
            <div className="pl-9 text-[10px] font-black text-amber-600 uppercase tracking-widest">
              Important: You won't be able to sign in until an admin approves your request.
            </div>
          </div>

          <div className="space-y-6">
            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="hero-btn w-full py-4 italic text-lg rounded-2xl block">Open Gmail</a>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Links expire in 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden text-slate-900">
      {/* Left Column (Visual) */}
      <div className="hidden md:flex md:w-2/5 relative p-12 bg-slate-50 border-r border-slate-100 flex-col justify-center items-center">
        <div className="max-w-md mx-auto">
          <span className="inline-badge mb-6">Discovery Awaits</span>
          <h1 className="editorial-header mb-6">Connect with your campus.</h1>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            Join the community. Discover workshops, sports, and cultural events happening at your college and beyond.
          </p>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <img
              src="/images/campus_life_professional.png"
              alt="Campus Life"
              className="w-full h-auto grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white p-8 md:p-16 lg:p-24 flex flex-col items-center">
        <div className="w-full max-w-xl animate-fade-in">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
            <p className="text-slate-500 mt-2 font-medium">Join your institution's network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Username"
                icon={User}
                required
                placeholder="Choose a username"
                value={form.username}
                error={fieldErrors.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <FormInput
                label="Full Name"
                icon={User}
                required
                placeholder="Firstname Lastname"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <FormInput
                label="College Email"
                icon={Mail}
                required
                type="email"
                placeholder="Enter college email"
                value={form.email}
                error={fieldErrors.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <FormInput
                label="Phone Number"
                icon={User}
                placeholder="Enter phone number"
                value={form.phone}
                error={fieldErrors.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <FormInput
                label="Student/Staff ID"
                icon={ShieldCheck}
                required
                placeholder="Enter institutional ID"
                value={form.officialId}
                error={fieldErrors.officialId}
                onChange={(e) => setForm({ ...form, officialId: e.target.value })}
              />

              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">College <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-11 flex items-center pointer-events-none">
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={loadingColleges ? "Loading universities..." : "Search for your college"}
                    value={collegeSearchTerm}
                    onChange={(e) => {
                      setCollegeSearchTerm(e.target.value);
                      setShowCollegeDropdown(true);
                      if (form.collegeId) setForm({ ...form, collegeId: "" });
                      setCollegeError("");
                    }}
                    onFocus={() => setShowCollegeDropdown(true)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                {collegeError && <p className="text-red-500 text-sm mt-1">{collegeError}</p>}

                {showCollegeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {filteredColleges.map((c) => (
                      <div
                        key={c._id}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"
                        onMouseDown={() => handleCollegeSelect(c)}
                      >
                        {c.name}
                      </div>
                    ))}
                    <div
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-indigo-600 font-bold border-t border-slate-100"
                      onMouseDown={() => handleCollegeSelect("custom")}
                    >
                      My college is not listed
                    </div>
                  </div>
                )}
              </div>

              {form.collegeId === "custom" && (
                <FormInput
                  label="Custom College Name"
                  icon={ChevronDown}
                  required
                  placeholder="Type your college name"
                  value={form.customCollegeName}
                  onChange={(e) => setForm({ ...form, customCollegeName: e.target.value })}
                />
              )}

              <FormInput
                label="Account Type"
                icon={ChevronDown}
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                suffix={<ChevronDown className="w-4 h-4 text-slate-400" />}
              >
                <option value="student">Student</option>
                <option value="college_admin">College Admin</option>
              </FormInput>

              {form.role === 'student' && (
                <>
                  <FormInput
                    label="Academic Class"
                    icon={Sparkles}
                    placeholder="e.g. B.Tech III Year"
                    value={form.academicClass}
                    required
                    onChange={(e) => setForm({ ...form, academicClass: e.target.value })}
                  />
                  <FormInput
                    label="Section"
                    icon={ShieldCheck}
                    placeholder="e.g. CSE-A"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <FormInput
                label="Password"
                icon={Lock}
                required
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <FormInput
                label="Confirm Password"
                icon={Lock}
                required
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="hero-btn w-full py-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">Sign in</Link>
            </p>
          </form>

          <p className="mt-12 text-[10px] text-center text-slate-400 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
            By signing up, you agree to our <span className="underline decoration-slate-200">Policies</span> and <span className="underline decoration-slate-200">Privacy terms</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
