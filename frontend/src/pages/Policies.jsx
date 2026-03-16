import { Link } from "react-router-dom";

const Policies = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        <div className="mb-8">
          <Link
            to="/register"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Back to Register
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
            CampusEventHub Policies
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Effective date: March 16, 2026
          </p>
        </div>

        <div className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 md:p-8">
          <section>
            <h2 className="text-xl font-bold">1. Platform Purpose</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              CampusEventHub helps colleges, students, and admins create, manage,
              and participate in campus events. Accounts are intended for valid
              educational-community use only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Account Responsibility</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              You are responsible for the accuracy of profile data, protecting your
              login credentials, and all activity performed through your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Verification and Approval</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              New accounts may require email verification and administrator approval
              before full access is enabled. We may reject or suspend accounts that
              violate campus rules or misuse the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Event Content Standards</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Event listings must be accurate, non-misleading, and appropriate for
              a campus environment. Content that is fraudulent, abusive, or harmful
              can be removed by administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. Registrations and Attendance</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Registration status, waitlists, approval decisions, and attendance are
              managed according to organizer and admin workflows configured inside
              the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Security and Abuse</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Attempts to bypass permissions, scrape private data, spam users, or
              disrupt service are prohibited and may result in immediate access
              removal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Changes to Policies</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Policies may be updated to improve safety, compliance, and service
              operation. Continued use after updates means you accept the revised
              terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Policies;
