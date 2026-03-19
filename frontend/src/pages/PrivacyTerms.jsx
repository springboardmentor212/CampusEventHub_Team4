import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "What we collect",
    body: [
      "We keep the basics needed to run CampusEventHub properly: your name, email address, college, account role, and the details you add when you create or join an event.",
      "If you use the platform regularly, we also store useful history like your registrations, attendance status, feedback, and account approval status. That helps the platform show the right information to the right people.",
    ],
  },
  {
    title: "Why we collect it",
    body: [
      "We use your information to operate the platform day to day. That includes helping you sign in, showing events that apply to you, handling approvals, tracking registrations, and sending updates when something changes.",
      "We also use it for practical communication, like verification emails, password resets, approval decisions, reminders, and event-related notifications.",
    ],
  },
  {
    title: "What we do not do",
    body: [
      "We do not sell your personal information.",
      "We do not hand your data to advertisers, brokers, or outside marketing lists. CampusEventHub exists to run campus events, not to turn your account into a product.",
    ],
  },
  {
    title: "Who can see what",
    body: [
      "Students, college admins, and platform admins do not all see the same things. We limit access based on role so people can do their job without seeing more than they need.",
      "For example, a college admin may need to review student accounts or event participation for their own college, while a platform admin may need broader visibility to keep the system healthy.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "We keep account and event information for as long as it is useful for operating the platform, resolving issues, and maintaining a clear activity history.",
      "If we no longer need something to run the product safely, we should not keep it longer than necessary.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "If something in your account is wrong, you should be able to update it or ask an admin for help.",
      "If you have a privacy concern, the right next step is to contact your college admin or the platform team so the issue can be reviewed by an actual person.",
    ],
  },
];

const Privacy = () => {
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
                Privacy
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Privacy, in plain English
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              If you use CampusEventHub, you deserve a clear answer about what we
              collect, why we collect it, and what we will never do with it.
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

          <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <p className="text-sm leading-6 text-slate-700">
              The short version: we collect the information needed to run the platform,
              keep students and admins informed, and make events easier to manage.
              We do not sell your data, and we should always be able to explain why
              a piece of information is being used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;