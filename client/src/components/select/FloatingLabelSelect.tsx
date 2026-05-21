import type { ChangeEvent, FC, ReactNode } from "react";


interface FloatingLabelSelectProps {
    label: string;
    newSelectClassName?: string;
    selectClassName?: string;
    newLabelClassName?: string;
    labelClassName?: string;
    name?: string;
    value?: string | any;
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    autoFocus?: boolean;
    disabled?: boolean;
    errors?: string[];
    children: ReactNode;
}
const FloatingLabelSelect: FC<FloatingLabelSelectProps> = ({ label, newSelectClassName, selectClassName, newLabelClassName, labelClassName, name, value, onChange, required, autoFocus, disabled, errors, children }) => {
    const hasError = Boolean(errors && errors.length > 0);
    const fieldName = name ?? "select";
    const defaultSelectClass = `block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border appearance-none focus:outline-none focus:ring-0 peer ${hasError ? "border-red-500 focus:border-red-500" : "border-default-medium focus:border-brand"} ${selectClassName ?? ""}`;

    return (
        <div>
            <div className="relative">
                <select
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    className={newSelectClassName ?? defaultSelectClass}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    required={required}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${fieldName}-error` : undefined}
                >
                    {children}
                </select>
                <label htmlFor={name} className={newLabelClassName ? newLabelClassName : `absolute text-sm text-gray-700 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto inset-s-1
                ${labelClassName ?? ""}`
                }
                >
                    {label}
                    {required && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </label>

            </div>
            {hasError && (
                <p id={`${fieldName}-error`} className="mt-1 text-sm text-red-600" role="alert">
                    {errors![0]}
                </p>
            )}
        </div>
    )
}

export default FloatingLabelSelect;
