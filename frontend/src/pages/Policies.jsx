import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "What we collect",
    body: [
      "We keep the information needed to run CampusEventHub properly: your email, your college, and your registration and attendance history.",
      "We may also store the details connected to your account role, approval status, and event activity so the platform can show the right information to the right people.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "We use this information to run the platform, send event notifications and reminders, and help admins manage their college without working from guesswork.",
      "That includes things like approvals, registration tracking, attendance, account verification, and event updates that need to reach the right students quickly.",
    ],
  },
  {
    title: "What we never do",
    body: [
      "We do not sell your data.",
      "We do not share it with advertisers, and we do not use it for anything outside the platform itself.",
    ],
  },
];

const Policies = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Policies
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              How CampusEventHub works for you
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This is the short version of how we handle your information on the platform, without turning it into a wall of legal text.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-6 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-8 text-sm leading-6 text-slate-600">
            Questions? Reach your college admin or the platform team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Policies;
