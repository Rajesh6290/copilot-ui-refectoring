const MenuLoader = () => {
  return (
    <div className="w-full space-y-4 p-4">
      {[1, 2, 3, 4, 5, 6].map((section) => (
        <div key={section} className="space-y-2">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
          <div className="space-y-1">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex h-8 w-full animate-pulse items-center space-x-2 rounded bg-gray-200 p-2"
              >
                <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                <div className="h-4 w-16 rounded bg-gray-300"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
export default MenuLoader;
