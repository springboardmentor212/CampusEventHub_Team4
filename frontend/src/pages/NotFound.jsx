import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Nothing here.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This page doesn't exist or may have moved.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
