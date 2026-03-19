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
  Loader2,
  Building2,
  GraduationCap,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { getRoleHomeRoute } from "../utils/roleRoutes";

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
    section: "",
  });

  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [collegeError, setCollegeError] = useState("");
  const [collegeSupportMessage, setCollegeSupportMessage] = useState("");
  const [checkingCollegeAdmin, setCheckingCollegeAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(getRoleHomeRoute(user.role));
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const res = await API.get("/colleges");
        if (res.data.success) setColleges(res.data.data.colleges);
      } catch (err) {
        toast.error("We couldn't load the college list right now.");
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, []);

  useEffect(() => {
    const checkCollegeAdmin = async () => {
      if (form.role !== "student" || !form.collegeId || form.collegeId === "custom") {
        setCollegeSupportMessage("");
        setCheckingCollegeAdmin(false);
        return;
      }

      try {
        setCheckingCollegeAdmin(true);
        const res = await API.get(`/colleges/${form.collegeId}/has-active-admin`);
        const hasAdmin = Boolean(res.data?.hasAdmin);

        if (!hasAdmin) {
          setCollegeSupportMessage(
            "Your college doesn't have an active admin yet. You can still sign up — we'll notify you when an admin approves your account. If you know your college admin, share this link with them: /register"
          );
        } else {
          setCollegeSupportMessage("");
        }
      } catch (err) {
        setCollegeSupportMessage("");
      } finally {
        setCheckingCollegeAdmin(false);
      }
    };

    checkCollegeAdmin();
  }, [form.role, form.collegeId]);

  const handleCollegeSelect = (college) => {
    if (college === "custom") {
      setForm({ ...form, collegeId: "custom", customCollegeName: "" });
      setCollegeSearchTerm("My college is not listed");
      setShowCollegeDropdown(false);
      setCollegeError("");
      setCollegeSupportMessage("");
      setCheckingCollegeAdmin(false);
      return;
    }

    setForm({ ...form, collegeId: college._id, customCollegeName: "" });
    setCollegeSearchTerm(college.name);
    setShowCollegeDropdown(false);
    setCollegeError("");
  };

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(collegeSearchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setCollegeError("");

    if (form.password !== form.confirmPassword) {
      toast.error("Your passwords need to match before you continue.");
      return;
    }

    if (!form.collegeId) {
      setCollegeError("Please choose your college to continue");
      return;
    }

    if (form.collegeId === "custom" && !form.customCollegeName.trim()) {
      toast.error("Tell us your college name so we can finish setting up your account.");
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
      await API.post("/auth/register", payload);
      toast.success("Your account has been created. Check your inbox for the next step.", { id: loadingToast });
      setRegisteredEmail(form.email);
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData?.message || "We couldn't create your account right now.";

      if (msg.toLowerCase().includes("email")) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
        toast.error("That email is already in use or needs attention.", { id: loadingToast });
      } else if (msg.toLowerCase().includes("username")) {
        setFieldErrors((prev) => ({ ...prev, username: msg }));
        toast.error("That username isn't available right now.", { id: loadingToast });
      } else if (msg.toLowerCase().includes("phone")) {
        setFieldErrors((prev) => ({ ...prev, phone: msg }));
        toast.error("That phone number needs another look.", { id: loadingToast });
      } else if (msg.toLowerCase().includes("id")) {
        setFieldErrors((prev) => ({ ...prev, officialId: msg }));
        toast.error("That ID couldn't be verified. Please check it and try again.", { id: loadingToast });
      } else {
        toast.error(msg, { id: loadingToast });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredEmail) {
    const isCollegeAdmin = form.role === "college_admin";

    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <MailCheck className="h-8 w-8" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Check your inbox
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              We sent a confirmation link to <span className="font-semibold text-slate-900">{registeredEmail}</span>.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left">
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">Here is what happens next:</p>
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
                    1
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Open the email from CampusEventHub and confirm your address.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
                    2
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Once verified, your request moves into approval.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
                    3
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {isCollegeAdmin
                      ? "A platform admin reviews college admin accounts before access is unlocked."
                      : "Your college admin reviews student accounts before access is unlocked."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm leading-6 text-amber-800">
                  You will not be able to sign in until your account has been approved.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Open Gmail
              </a>
              <p className="text-xs text-slate-500">
                If you do not see the email, check Promotions or Spam.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isStudent = form.role === "student";

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              {isStudent ? <GraduationCap className="h-4 w-4 text-indigo-600" /> : <Building2 className="h-4 w-4 text-indigo-600" />}
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {isStudent ? "Student registration" : "College admin registration"}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {isStudent ? "Create your student account" : "Set up your college admin account"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isStudent
                ? "Join CampusEventHub to discover events, register faster, and stay in the loop."
                : "Create your account to publish events, manage approvals, and keep your campus informed."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Username"
              icon={User}
              required
              placeholder="Choose a username"
              value={form.username}
              error={fieldErrors.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
            />

            <FormInput
              label="Full name"
              icon={User}
              required
              placeholder="First and last name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              autoComplete="name"
            />

            <FormInput
              label="College email"
              icon={Mail}
              required
              type="email"
              placeholder="name@college.edu"
              value={form.email}
              error={fieldErrors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />

            <FormInput
              label="Phone number"
              icon={User}
              placeholder="Enter your phone number"
              value={form.phone}
              error={fieldErrors.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
            />

            <FormInput
              label={isStudent ? "Student ID" : "Staff ID"}
              icon={ShieldCheck}
              required
              placeholder={isStudent ? "Enter your student ID" : "Enter your staff ID"}
              value={form.officialId}
              error={fieldErrors.officialId}
              onChange={(e) => setForm({ ...form, officialId: e.target.value })}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                College <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={loadingColleges ? "Loading colleges..." : "Search for your college"}
                  value={collegeSearchTerm}
                  onChange={(e) => {
                    setCollegeSearchTerm(e.target.value);
                    setShowCollegeDropdown(true);
                    if (form.collegeId) setForm({ ...form, collegeId: "" });
                    setCollegeError("");
                    setCollegeSupportMessage("");
                    setCheckingCollegeAdmin(false);
                  }}
                  onFocus={() => setShowCollegeDropdown(true)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400"
                />

                {showCollegeDropdown && (
                  <div className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                    {filteredColleges.map((college) => (
                      <div
                        key={college._id}
                        className="cursor-pointer px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        onMouseDown={() => handleCollegeSelect(college)}
                      >
                        {college.name}
                      </div>
                    ))}
                    <div
                      className="cursor-pointer border-t border-slate-100 px-4 py-3 text-sm font-semibold text-indigo-600 hover:bg-slate-50"
                      onMouseDown={() => handleCollegeSelect("custom")}
                    >
                      My college is not listed
                    </div>
                  </div>
                )}
              </div>

              {collegeError && (
                <p className="mt-2 text-sm text-rose-600">{collegeError}</p>
              )}

              {collegeSupportMessage && (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <p className="text-sm leading-6 text-amber-800">{collegeSupportMessage}</p>
                  </div>
                </div>
              )}

              {checkingCollegeAdmin && (
                <p className="mt-2 text-sm text-slate-500">
                  Checking whether your college admin is ready to approve accounts...
                </p>
              )}
            </div>

            {form.collegeId === "custom" && (
              <FormInput
                label="College name"
                icon={Building2}
                required
                placeholder="Type your college name"
                value={form.customCollegeName}
                onChange={(e) => setForm({ ...form, customCollegeName: e.target.value })}
              />
            )}

            <FormInput
              label="Account type"
              icon={ChevronDown}
              required
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value,
                  academicClass: e.target.value === "student" ? form.academicClass : "",
                  section: e.target.value === "student" ? form.section : "",
                })
              }
              suffix={<ChevronDown className="h-4 w-4 text-slate-400" />}
            >
              <option value="student">Student</option>
              <option value="college_admin">College Admin</option>
            </FormInput>

            {isStudent && (
              <>
                <FormInput
                  label="Academic class"
                  icon={GraduationCap}
                  placeholder="For example: B.Tech III Year"
                  value={form.academicClass}
                  required
                  onChange={(e) => setForm({ ...form, academicClass: e.target.value })}
                />
                <FormInput
                  label="Section"
                  icon={ShieldCheck}
                  placeholder="For example: CSE-A"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                />
              </>
            )}

            <div className="grid grid-cols-1 gap-5 border-t border-slate-200 pt-5 md:grid-cols-2">
              <FormInput
                label="Password"
                icon={Lock}
                required
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              <FormInput
                label="Confirm password"
                icon={Lock}
                required
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating your account
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="border-t border-slate-200 pt-5 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700">
                  Sign in
                </Link>
              </p>
            </div>
          </form>

          <p className="mt-6 text-center text-xs leading-6 text-slate-500">
            By creating an account, you agree to our{" "}
            <Link to="/policies" className="font-medium text-indigo-600 hover:text-indigo-700">
              Policies
            </Link>{" "}
            and{" "}
            <Link to="/privacy-terms" className="font-medium text-indigo-600 hover:text-indigo-700">
              Privacy Terms
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
