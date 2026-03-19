const ContentEmptyState = ({ icon: Icon, title, description, actionLabel, onAction, className = "" }) => {
  return (
    <div className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center ${className}`}>
      {Icon ? <Icon className="w-10 h-10 mx-auto text-slate-300" /> : null}
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};

export default ContentEmptyState;
