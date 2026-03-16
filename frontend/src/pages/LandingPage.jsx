import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  GraduationCap,
  PencilLine,
  Shield,
  Users,
} from "lucide-react";

const painPoints = [
  "Event details sent across four different groups.",
  "Someone registered. You lost the list.",
  "Students asking daily if the event is confirmed.",
  "Event was full. Nobody knew there was a waitlist.",
];

const features = [
  {
    title: "Approvals in minutes",
    lines: [
      "Not days. Not sitting in someone's inbox.",
      "Submit. Review. Done.",
    ],
    tone: "bg-blue-50",
    icon: CalendarCheck2,
  },
  {
    title: "Waitlists that move on their own",
    lines: [
      "Someone drops out at midnight.",
      "The next person gets notified by morning.",
      "You didn't lift a finger.",
    ],
    tone: "bg-emerald-50",
    icon: BellRing,
  },
  {
    title: "Reminders you set once",
    lines: [
      "Students get an email the day before",
      "and another one an hour before.",
      "You set it when creating the event.",
      "That's it.",
    ],
    tone: "bg-amber-50",
    icon: BellRing,
  },
  {
    title: "Everyone sees only what's theirs",
    lines: [
      "Students see events.",
      "Admins see their college.",
      "Platform admin sees everything.",
    ],
    tone: "bg-blue-50",
    icon: Users,
  },
  {
    title: "Changes reach everyone",
    lines: [
      "Event updated? Every registered student",
      "gets an email with what changed.",
      "No one shows up to the wrong place.",
    ],
    tone: "bg-emerald-50",
    icon: CheckCircle2,
  },
  {
    title: "Feedback that actually arrives",
    lines: [
      "After the event, students are asked.",
      "Ratings and comments go to the admin.",
      "You know what worked.",
    ],
    tone: "bg-amber-50",
    icon: GraduationCap,
  },
];

const faqs = [
  {
    q: "Is it free?",
    a: ["Yes. No payment, no trial period.", "Just create an account."],
  },
  {
    q: "My college isn't in the list.",
    a: [
      "Type it in when signing up.",
      "It gets created when your account is approved.",
    ],
  },
  {
    q: "What if an event is full?",
    a: [
      "You join the waitlist.",
      "When a spot opens, you get 24 hours to confirm.",
    ],
  },
  {
    q: "Can students from other colleges join my event?",
    a: [
      "Only if the admin opens it to all colleges",
      "when creating the event.",
    ],
  },
  {
    q: "How fast are approvals?",
    a: [
      "You get notified the moment a decision is made.",
      "Usually same day.",
    ],
  },
];

const LandingPage = () => {
  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: '"Outfit", sans-serif' }}
    >
      <header className="sticky top-0 z-50 border-b-2 border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 md:px-8">
          <p className="text-xl font-extrabold tracking-[-0.02em]">CampusHub</p>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-700 md:flex">
            <a href="#problem" className="transition-colors duration-200 hover:text-blue-500">
              Explore
            </a>
            <a href="#roles" className="transition-colors duration-200 hover:text-blue-500">
              Students
            </a>
            <a href="#roles" className="transition-colors duration-200 hover:text-blue-500">
              Admins
            </a>
            <a href="#faq" className="transition-colors duration-200 hover:text-blue-500">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex h-12 items-center rounded-md bg-gray-100 px-5 text-sm font-semibold text-gray-900 transition-all duration-200 hover:scale-105 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-blue-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gray-100 py-16 md:py-24">
          <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rotate-12 bg-blue-500/10" />
          <div className="pointer-events-none absolute -left-8 bottom-8 h-28 w-28 rounded-full bg-emerald-500/10" />
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 md:px-8 lg:grid-cols-2">
            <div>
              <h1 className="text-5xl font-extrabold leading-[0.94] tracking-[-0.02em] text-gray-900 sm:text-6xl md:text-7xl">
                Your college events,
                <br />
                sorted.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-700">
                Registration. Approvals. Attendance.
                <br />
                All in one place.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex h-14 items-center rounded-md bg-blue-500 px-7 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Get Started - free
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-14 items-center rounded-md border-4 border-blue-500 bg-transparent px-7 text-sm font-semibold text-blue-500 transition-all duration-200 hover:scale-105 hover:bg-blue-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Sign In
                </Link>
              </div>

              <p className="mt-4 text-sm text-gray-600">Just your college email. Nothing else.</p>
            </div>

            <div className="relative">
              <div className="rounded-lg bg-white p-3">
                <img
                  src="/images/campus_life_professional.png"
                  alt="Campus event management dashboard preview"
                  className="h-full w-full rounded-md object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900">
                Spring Tech Symposium starts in 2 hours
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-8">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <p className="bg-gray-100 px-6 py-4 text-center text-base font-semibold tracking-[-0.01em] text-gray-800 md:text-lg">
              One platform. Three roles. Everything connected.
            </p>
          </div>
        </section>

        <section id="problem" className="bg-white py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">Sound familiar?</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {painPoints.map((point) => (
                <article
                  key={point}
                  className="group cursor-pointer rounded-lg bg-gray-100 p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-200"
                >
                  <p className="text-lg leading-relaxed text-gray-800">"{point}"</p>
                </article>
              ))}
            </div>
            <p className="mt-8 text-lg font-semibold text-gray-900">That's exactly what we built this to fix.</p>
          </div>
        </section>

        <section className="bg-gray-900 py-16 text-white md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em]">How it works</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <article className="group rounded-lg bg-blue-500 p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-600">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-500 transition-transform duration-200 group-hover:scale-110">
                  <PencilLine size={24} strokeWidth={2.5} />
                </div>
                <p className="text-base font-semibold">Admin creates the event</p>
                <p className="mt-3 text-sm leading-relaxed text-blue-50">
                  Date, capacity, audience. Submit.
                  <br />
                  Your part is done in minutes.
                </p>
              </article>

              <article className="group rounded-lg bg-emerald-500 p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-600">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 transition-transform duration-200 group-hover:scale-110">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
                <p className="text-base font-semibold">Platform admin approves it</p>
                <p className="mt-3 text-sm leading-relaxed text-emerald-50">
                  One review. One click.
                  <br />
                  Students can now see it.
                </p>
              </article>

              <article className="group rounded-lg bg-amber-500 p-6 text-gray-900 transition-all duration-200 hover:scale-[1.02] hover:bg-amber-400">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-amber-600 transition-transform duration-200 group-hover:scale-110">
                  <Users size={24} strokeWidth={2.5} />
                </div>
                <p className="text-base font-semibold">Students register and show up</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-900">
                  They register, get reminders,
                  <br />
                  and know exactly where to be.
                  <br />
                  If it's full, they join the waitlist.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gray-100 py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">Everything just works</h2>
            <p className="mt-4 max-w-xl text-lg text-gray-700">We automated the parts nobody wants to deal with.</p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className={`group cursor-pointer rounded-lg p-6 transition-all duration-200 hover:scale-[1.02] ${feature.tone}`}
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-500 transition-transform duration-200 group-hover:scale-110">
                      <Icon size={22} strokeWidth={2.25} />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{feature.title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700">
                      {feature.lines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="roles" className="bg-white py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">Built for all three of you</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <article className="group rounded-lg bg-gray-100 p-7 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-200">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-500 transition-transform duration-200 group-hover:scale-110">
                  <GraduationCap size={22} strokeWidth={2.25} />
                </div>
                <p className="text-lg font-bold text-gray-900">You're a student</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  Find events at your college and others.
                  <br />
                  Register in one click.
                  <br />
                  Get reminded before it starts.
                  <br />
                  Rate it when it ends.
                </p>
                <Link
                  to="/register"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-blue-500 transition-colors duration-200 hover:text-blue-600"
                >
                  Browse events <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
                </Link>
              </article>

              <article className="group rounded-lg bg-blue-500 p-7 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-blue-600">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-500 transition-transform duration-200 group-hover:scale-110">
                  <Building2 size={22} strokeWidth={2.25} />
                </div>
                <p className="text-lg font-bold">You run events</p>
                <p className="mt-3 text-sm leading-relaxed text-blue-50">
                  Create events and submit for approval.
                  <br />
                  Manage who's in, who attended.
                  <br />
                  See feedback when it's over.
                </p>
                <Link
                  to="/register"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-white transition-colors duration-200 hover:text-blue-100"
                >
                  Start managing <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
                </Link>
              </article>

              <article className="group rounded-lg bg-gray-100 p-7 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-200">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-500 transition-transform duration-200 group-hover:scale-110">
                  <Shield size={22} strokeWidth={2.25} />
                </div>
                <p className="text-lg font-bold text-gray-900">You run the platform</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  Approve colleges and admins.
                  <br />
                  Review every event before it goes live.
                  <br />
                  See what's happening across every college.
                </p>
                <Link
                  to="/login"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-600 transition-colors duration-200 hover:text-emerald-700"
                >
                  View dashboard <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-emerald-500 py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <blockquote className="rounded-lg bg-white p-10 text-gray-900">
              <p className="text-2xl font-bold leading-relaxed tracking-[-0.02em]">
                "I used to manage registrations in a spreadsheet and chase approvals on WhatsApp.
                <br />
                <br />
                Now I just check my dashboard."
              </p>
              <footer className="mt-5 text-sm font-semibold text-gray-700">- College Admin, CampusEventHub</footer>
            </blockquote>
          </div>
        </section>

        <section id="faq" className="bg-gray-100 py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">Quick answers</h2>
            <div className="mt-8 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="rounded-lg border-2 border-gray-200 bg-white p-5">
                  <summary className="cursor-pointer text-base font-semibold text-gray-900">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {item.a.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-amber-500 py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">Ready to run your first event?</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-900">
                  2 minutes to sign up.
                  <br />
                  No setup. No training.
                  <br />
                  Just go.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[260px]">
                <Link
                  to="/register"
                  className="inline-flex h-14 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-500"
                >
                  Create your account
                </Link>
                <p className="text-center text-sm text-gray-900">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold underline decoration-gray-900/60 underline-offset-4 transition-colors duration-200 hover:text-gray-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-12 text-white">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            <div>
              <p className="text-lg font-extrabold tracking-[-0.02em]">CampusHub</p>
              <p className="mt-2 text-sm text-gray-200">Made by Team 4</p>
              <p className="mt-1 text-sm font-semibold text-gray-100">@udaycodespace  @gaytridevi</p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-300">Quick links</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <Link
                  to="/policies"
                  className="rounded-md bg-white px-4 py-2 font-semibold text-gray-900 transition-all duration-200 hover:scale-105"
                >
                  Policies
                </Link>
                <Link
                  to="/privacy-terms"
                  className="rounded-md bg-white px-4 py-2 font-semibold text-gray-900 transition-all duration-200 hover:scale-105"
                >
                  Privacy
                </Link>
                <Link
                  to="/login"
                  className="rounded-md bg-white px-4 py-2 font-semibold text-gray-900 transition-all duration-200 hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-300">Tagline</p>
              <p className="mt-3 text-sm text-gray-100">Built for campus.</p>
              <p className="text-sm text-gray-100">Kept simple.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
