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
  "The event poster changed, but half the students still have the old one.",
  "Registrations are scattered across forms, chats, and spreadsheets.",
  "Students keep asking if the event is approved because no one knows for sure.",
  "Seats opened up, but the waitlist never heard about it in time.",
];

const features = [
  {
    title: "Approvals that keep things moving",
    lines: [
      "An event gets submitted, reviewed, and published",
      "without disappearing into a long thread.",
      "Everyone knows where it stands.",
    ],
    tone: "bg-blue-50",
    icon: CalendarCheck2,
  },
  {
    title: "Waitlists that do the follow-up for you",
    lines: [
      "When a seat opens, the next student is moved up.",
      "No manual reshuffling.",
      "No one gets skipped by accident.",
    ],
    tone: "bg-emerald-50",
    icon: BellRing,
  },
  {
    title: "Reminders that arrive at the right time",
    lines: [
      "Students hear about the event before it slips",
      "off their radar.",
      "You set it once when the event is created.",
    ],
    tone: "bg-amber-50",
    icon: BellRing,
  },
  {
    title: "Clear access for every role",
    lines: [
      "Students see what they can join.",
      "College admins manage their own campus.",
      "Platform admins keep the whole system in shape.",
    ],
    tone: "bg-blue-50",
    icon: Users,
  },
  {
    title: "Updates that reach the right people fast",
    lines: [
      "If a room changes or timing shifts,",
      "registered students hear about it right away.",
      "No one shows up to the wrong place.",
    ],
    tone: "bg-emerald-50",
    icon: CheckCircle2,
  },
  {
    title: "Feedback that helps the next event improve",
    lines: [
      "Students can respond while the experience is still fresh.",
      "Admins get a clearer read on what worked.",
      "The next event starts smarter.",
    ],
    tone: "bg-amber-50",
    icon: GraduationCap,
  },
];

const faqs = [
  {
    q: "Is CampusEventHub free to use?",
    a: [
      "Yes. You can sign up and start using the platform without a payment step.",
      "If that ever changes, it will be communicated clearly before anyone is asked to upgrade.",
    ],
  },
  {
    q: "What if my college is not listed yet?",
    a: [
      "Go ahead and sign up anyway.",
      "If your college is not in the list, we create it during the approval flow so you are not blocked on day one.",
    ],
  },
  {
    q: "What happens when an event fills up?",
    a: [
      "Students can still join the waitlist instead of hitting a dead end.",
      "If a seat opens, the platform moves the next person in line forward automatically.",
    ],
  },
  {
    q: "Can events be opened to students from other colleges?",
    a: [
      "Yes, when the organizer chooses that setting while creating the event.",
      "Some events stay campus-specific, and some are meant to bring multiple colleges together.",
    ],
  },
  {
    q: "How fast do approvals usually happen?",
    a: [
      "Fast enough that students are not left guessing.",
      "The exact timing depends on the admin team, but the platform makes status visible so nobody is stuck chasing updates.",
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
          <p className="text-xl font-extrabold tracking-[-0.02em]">CampusEventHub</p>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-700 md:flex">
            <a href="#problem" className="transition-colors duration-200 hover:text-blue-500">
              Explore
            </a>
            <a href="#roles" className="transition-colors duration-200 hover:text-blue-500">
              For Students
            </a>
            <a href="#roles" className="transition-colors duration-200 hover:text-blue-500">
              For Admins
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
              Create Account
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
                Run campus events
                <br />
                without the chaos.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-700">
                CampusEventHub helps colleges publish events, handle approvals,
                <br />
                manage registrations, and keep students informed from start to finish.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex h-14 items-center rounded-md bg-blue-500 px-7 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Start free
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-14 items-center rounded-md border-4 border-blue-500 bg-transparent px-7 text-sm font-semibold text-blue-500 transition-all duration-200 hover:scale-105 hover:bg-blue-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Sign In
                </Link>
              </div>

              <p className="mt-4 text-sm text-gray-600">Use your campus email and get started in a few minutes.</p>
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
                
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-8">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <p className="bg-gray-100 px-6 py-4 text-center text-base font-semibold tracking-[-0.01em] text-gray-800 md:text-lg">
              One platform for approvals, registrations, attendance, and follow-through.
            </p>
          </div>
        </section>

        <section id="problem" className="bg-white py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">This is what campus event chaos looks like</h2>
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
            <p className="mt-8 text-lg font-semibold text-gray-900">CampusEventHub was built to replace that mess with one clear system.</p>
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
                <p className="text-base font-semibold">An organizer publishes the plan</p>
                <p className="mt-3 text-sm leading-relaxed text-blue-50">
                  They set the date, audience, and capacity.
                  <br />
                  The event enters review with the right details in place.
                </p>
              </article>

              <article className="group rounded-lg bg-emerald-500 p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-600">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 transition-transform duration-200 group-hover:scale-110">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
                <p className="text-base font-semibold">The platform approves what should go live</p>
                <p className="mt-3 text-sm leading-relaxed text-emerald-50">
                  Admins review events, approve them, and keep standards clear.
                  <br />
                  Students only see what is ready.
                </p>
              </article>

              <article className="group rounded-lg bg-amber-500 p-6 text-gray-900 transition-all duration-200 hover:scale-[1.02] hover:bg-amber-400">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-amber-600 transition-transform duration-200 group-hover:scale-110">
                  <Users size={24} strokeWidth={2.5} />
                </div>
                <p className="text-base font-semibold">Students join with confidence</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-900">
                  They can register, get reminders,
                  <br />
                  and know where things stand.
                  <br />
                  If seats run out, the waitlist keeps moving.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gray-100 py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">The operational parts are finally handled</h2>
            <p className="mt-4 max-w-xl text-lg text-gray-700">The platform takes care of the follow-up work that usually breaks down first.</p>

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
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">Built for the people actually running campus life</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <article className="group rounded-lg bg-gray-100 p-7 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-200">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-500 transition-transform duration-200 group-hover:scale-110">
                  <GraduationCap size={22} strokeWidth={2.25} />
                </div>
                <p className="text-lg font-bold text-gray-900">For students</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  You hear about an event, open one page,
                  <br />
                  and instantly know if it is approved,
                  <br />
                  if seats are still open,
                  <br />
                  and whether it is worth saving time for.
                </p>
                <Link
                  to="/register"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-blue-500 transition-colors duration-200 hover:text-blue-600"
                >
                  Start exploring <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
                </Link>
              </article>

              <article className="group rounded-lg bg-blue-500 p-7 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-blue-600">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-500 transition-transform duration-200 group-hover:scale-110">
                  <Building2 size={22} strokeWidth={2.25} />
                </div>
                <p className="text-lg font-bold">For college admins</p>
                <p className="mt-3 text-sm leading-relaxed text-blue-50">
                  You are planning a real event with real turnout.
                  <br />
                  You need approvals, attendance, reminders,
                  <br />
                  and last-minute changes handled
                  <br />
                  without chasing people across five tools.
                </p>
                <Link
                  to="/register"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-white transition-colors duration-200 hover:text-blue-100"
                >
                  Start managing events <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
                </Link>
              </article>

              <article className="group rounded-lg bg-gray-100 p-7 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-200">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-500 transition-transform duration-200 group-hover:scale-110">
                  <Shield size={22} strokeWidth={2.25} />
                </div>
                <p className="text-lg font-bold text-gray-900">For platform admins</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  You are responsible for keeping the platform trusted.
                  <br />
                  That means approving the right colleges,
                  <br />
                  reviewing what goes live,
                  <br />
                  and having a clear view across the whole network.
                </p>
                <Link
                  to="/login"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-600 transition-colors duration-200 hover:text-emerald-700"
                >
                  Open admin view <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2.25} />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-emerald-500 py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <blockquote className="rounded-lg bg-white p-10 text-gray-900">
              <p className="text-2xl font-bold leading-relaxed tracking-[-0.02em]">
                "The biggest difference is clarity.
                <br />
                <br />
                Students know what is happening, organizers know who is coming,
                and admins are not stuck answering the same question all day."
              </p>
              <footer className="mt-5 text-sm font-semibold text-gray-700">- Early campus operations feedback</footer>
            </blockquote>
          </div>
        </section>

        <section id="faq" className="bg-gray-100 py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">Questions people usually ask first</h2>
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
                <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-gray-900">Ready to run the next event with less friction?</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-900">
                  Set up your account,
                  <br />
                  bring your campus into one workflow,
                  <br />
                  and stop managing events through guesswork.
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
              <p className="text-lg font-extrabold tracking-[-0.02em]">CampusEventHub</p>
              <p className="mt-2 text-sm text-gray-200">A calmer way to run campus events from announcement to feedback.</p>
              <p className="mt-1 text-sm font-semibold text-gray-100">Built for students, organizers, and campus teams.</p>
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
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-300">Why it exists</p>
              <p className="mt-3 text-sm text-gray-100">Campus events deserve better systems.</p>
              <p className="text-sm text-gray-100">This is the one built for that job.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;