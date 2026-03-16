import { Link } from "react-router-dom";

const PrivacyTerms = () => {
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
            Privacy Terms
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Effective date: March 16, 2026
          </p>
        </div>

        <div className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 md:p-8">
          <section>
            <h2 className="text-xl font-bold">1. Data We Collect</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              We collect account details such as name, email, phone, institutional
              ID, role, college association, and event participation records needed
              to operate CampusEventHub.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Why We Use Data</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Data is used for authentication, role approval flows, event
              registration, notifications, feedback, and platform analytics to
              improve event management experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Who Can View Data</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Access is role-based. Students, college admins, and superadmins see
              only the information allowed by their permissions and workflow needs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Notifications and Email</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              We send system messages for account verification, approvals,
              registration updates, and important event actions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. Security Controls</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              We apply access controls and authentication checks to protect data.
              Users should also keep passwords private and update compromised
              credentials immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Retention and Deletion</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Data is retained as needed for active platform use, auditing, and
              operational continuity. Account deletion requests are handled through
              supported account workflows.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Policy Updates</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              Privacy terms may change as the product evolves. Updated terms are
              effective when published in the platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyTerms;
