"use client";
import { FormikProps } from "formik";
import { useTheme } from "next-themes";
import React, {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  HTMLInputTypeAttribute,
  SetStateAction,
  useState
} from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

interface Props {
  type?: HTMLInputTypeAttribute;
  value?: string | number | string[] | File;
  onChange?: (
    event:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => void;
  onBlur?: (
    event:
      | FocusEvent<HTMLInputElement, Element>
      | FocusEvent<HTMLTextAreaElement, Element>
  ) => void;
  link?: string;
  error?: boolean;
  key?: string | number;
  helperText?: string | false;
  fullWidth?: boolean;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  options?: { label: string | number; value: string | number }[];
  id?: string | number;
  variant?: "filled" | "outlined" | "standard";
  inputProps?: object;
  multiline?: boolean;
  rows?: number;
  defaultValue?: string | number | [] | object;
  label?: string;
  size?: "small" | "medium";
  formik?: FormikProps<{ [key: string]: string }>;
  labelPlacement?: "bottom" | "top" | "start" | "end" | undefined;
  checkedIcon?: React.ReactNode;
  checkboxIcon?: React.ReactNode;
  marks?: boolean | { value: number; label: number }[];
  step?: number;
  valueLabelDisplay?: "auto" | "on" | "off";
  orientation?: "horizontal" | "vertical";
  min?: number;
  max?: number;
  loading?: boolean;
  fileSize?: number;
  setAutoCompleteValue?: Dispatch<SetStateAction<string>>;
  fileAccept?: string;
  allOnChange?: (
    event:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => void;
}

const CustomInputField = ({
  type = "text",
  value,
  label,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
  name,
  disabled,
  id,
  options,
  rows,
  formik,
  min = 0,
  max = 100,
  fileSize = 200, // accepts 200kb in size
  setAutoCompleteValue
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const themeClasses = isDarkMode
    ? "bg-gray-900 text-white border-gray-700"
    : "bg-white text-gray-900 border-gray-300";

  switch (type) {
    case "text":
    case "email":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            placeholder={placeholder}
            name={name}
            id={String(id)}
            type={type}
            value={value as string}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
          />
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "textarea":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <textarea
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            placeholder={placeholder}
            name={name}
            id={String(id)}
            rows={rows}
            value={value as string}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
          />
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "password":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <div className="relative">
            <input
              className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                error ? "border-red-500" : "border-gray-300"
              } ${themeClasses}`}
              placeholder={placeholder}
              name={name}
              id={String(id)}
              type={showPassword ? "text" : "password"}
              value={value as string}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) =>
              formik && formik.setFieldValue(name!, e.target.checked)
            }
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span>{label}</span>
        </label>
      );

    case "checkbox-group":
      return (
        <div className="space-y-2">
          {options?.map((option, i) => (
            <label key={i} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(value as string[])?.includes(String(option.value))}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...(value as string[]), option.value]
                    : (value as string[]).filter((v) => v !== option.value);
                  if (formik) {
                    formik.setFieldValue(name!, newValue);
                  }
                }}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );

    case "radio":
      return (
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={Boolean(value)}
            onChange={(e) =>
              formik && formik.setFieldValue(name!, e.target.checked)
            }
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span>{label}</span>
        </label>
      );

    case "radio-group":
      return (
        <div className="space-y-2">
          {options?.map((option, i) => (
            <label key={i} className="flex items-center space-x-2">
              <input
                type="radio"
                checked={value === option.value}
                onChange={() =>
                  formik && formik.setFieldValue(name!, option.value)
                }
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    case "select":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <select
            name={name}
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            value={(value as string) || ""}
            onChange={(e) => {
              if (formik) {
                formik.setFieldValue(name!, e.target.value);
              }
              if (onChange) {
                onChange(e);
              }
            }}
            disabled={disabled}
          >
            <option value="">Select an option</option>
            {options?.map((option) => (
              <option
                key={`${option.value}-${option.label}`}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "multiselect":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <select
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            value={value as string[]}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions).map(
                (option) => option.value
              );
              if (formik) {
                formik.setFieldValue(name!, selectedOptions);
              }
            }}
            disabled={disabled}
            multiple
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "file":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            type="file"
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (fileSize && file && file.size / 1000 > fileSize && formik) {
                formik.setFieldError(
                  name!,
                  `Please select a file under size ${fileSize}KB`
                );
              }
              if (formik) {
                formik.setFieldValue(name!, file);
              }
            }}
            disabled={disabled}
          />
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "audio":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            type="file"
            accept="audio/*"
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (fileSize && file && file.size / 1000 > fileSize && formik) {
                formik.setFieldError(
                  name!,
                  `Please select a file under size ${fileSize}KB`
                );
              }
              if (formik) {
                formik.setFieldValue(name!, file);
              }
            }}
            disabled={disabled}
          />
          {value && (
            <audio controls className="mt-2">
              <source
                src={URL.createObjectURL(value as File)}
                type="audio/mpeg"
              />
              <track
                kind="captions"
                src=""
                label="No captions available"
                default
              />
              Your browser does not support the audio element.
            </audio>
          )}
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "image":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            type="file"
            accept="image/*"
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (fileSize && file && file.size / 1000 > fileSize && formik) {
                formik.setFieldError(
                  name!,
                  `Please select a file under size ${fileSize}KB`
                );
              }
              if (formik) {
                formik.setFieldValue(name!, file);
              }
            }}
            disabled={disabled}
          />
          {value && (
            <img
              src={URL.createObjectURL(value as File)}
              alt="Preview"
              className="mt-2 h-auto max-w-full"
            />
          )}
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "date":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            type="date"
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            value={value as string}
            onChange={(e) =>
              formik && formik.setFieldValue(name!, e.target.value)
            }
            disabled={disabled}
          />
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "slider":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            type="range"
            min={min}
            max={max}
            value={value as number}
            onChange={(e) =>
              formik && formik.setFieldValue(name!, e.target.value)
            }
            className="w-full"
          />
        </div>
      );

    case "autocomplete":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            type="text"
            value={value as string}
            onChange={(e) => {
              if (formik) {
                formik.setFieldValue(name!, e.target.value);
              }
              if (setAutoCompleteValue) {
                setAutoCompleteValue(e.target.value);
              }
            }}
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            placeholder={placeholder}
            disabled={disabled}
          />
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    case "multiautocomplete":
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            type="text"
            value={value as string}
            onChange={(e) => {
              if (formik) {
                formik.setFieldValue(name!, e.target.value);
              }
              if (setAutoCompleteValue) {
                setAutoCompleteValue(e.target.value);
              }
            }}
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            placeholder={placeholder}
            disabled={disabled}
          />
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );

    default:
      return (
        <div className="w-full">
          {label && (
            <label className="mb-1 block text-sm font-medium">{label}</label>
          )}
          <input
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
              error ? "border-red-500" : "border-gray-300"
            } ${themeClasses}`}
            placeholder={placeholder}
            name={name}
            id={String(id)}
            type={type}
            value={value as string}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
          />
          {error && <p className="mt-1 text-sm text-red-500">{helperText}</p>}
        </div>
      );
  }
};

export default CustomInputField;
