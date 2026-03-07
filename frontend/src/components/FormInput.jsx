import React from 'react';

const FormInput = ({
    label,
    icon: Icon,
    type = "text",
    placeholder,
    value,
    onChange,
    onBlur,
    required = false,
    className = "",
    error,
    suffix,
    children,
    rows,
    ...props
}) => {
    const isTextarea = type === "textarea";
    const isSelect = !!children;
    const Component = isTextarea ? "textarea" : (isSelect ? "select" : "input");

    return (
        <div className={`space-y-2 group w-full ${className}`}>
            {label && (
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-indigo-600 leading-none">
                    {label}
                </label>
            )}
            <div className={`
                flex items-center 
                bg-slate-50 border border-slate-100 
                rounded-2xl transition-all duration-300
                focus-within:bg-white focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-500/8
                hover:border-slate-200
                ${isTextarea ? 'items-start pt-1' : ''}
                ${error ? 'border-rose-200 bg-rose-50/30 focus-within:border-rose-400 focus-within:ring-rose-500/5' : ''}
            `}>
                {Icon && (
                    <div className={`pl-4 pr-0 flex items-center justify-center shrink-0 ${isTextarea ? 'mt-4' : ''}`}>
                        <Icon strokeWidth={2.5} className="w-5 h-5 text-slate-400 transition-all duration-300 group-focus-within:text-indigo-600 group-focus-within:scale-110" />
                    </div>
                )}
                <Component
                    type={isTextarea || isSelect ? undefined : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    required={required}
                    rows={rows}
                    className={`
                        flex-1 min-w-0 bg-transparent border-none outline-none 
                        py-4 ${Icon ? 'pl-3' : 'pl-5'} pr-5
                        text-sm font-bold text-slate-900 
                        placeholder:text-slate-400 placeholder:font-medium
                        appearance-none
                        ${isTextarea ? 'resize-none min-h-[120px]' : ''}
                    `}
                    {...props}
                >
                    {children}
                </Component>
                {suffix && !isTextarea && (
                    <div className="pr-5 pl-1 flex items-center justify-center shrink-0">
                        {suffix}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormInput;
