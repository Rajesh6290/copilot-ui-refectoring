const CustomLoading = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Loading SVG Animation */}
      <svg className="size-32 text-indigo-600" viewBox="0 0 50 50">
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M25 5a20 20 0 0 1 20 20H25z"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Loading Message */}
      <p className="text-center text-base font-medium text-gray-700 dark:text-gray-200">
        {message}
      </p>
    </div>
  );
};

export default CustomLoading;
