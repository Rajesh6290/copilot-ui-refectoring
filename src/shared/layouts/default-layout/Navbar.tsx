import { Dispatch, SetStateAction } from "react";
import { RiMenu3Line } from "react-icons/ri";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownUser from "./DropdownUser";

const Navbar = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  fullWidth: boolean;
  setFullWidth: () => void;
}) => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white dark:border-b dark:border-[#272727] dark:bg-darkSidebarBackground dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-2 shadow md:px-4">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <div
            onClick={() => props.setSidebarOpen(!props.sidebarOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                props.setSidebarOpen(!props.sidebarOpen);
              }
            }}
            role="button"
            tabIndex={0}
            className="block w-fit cursor-pointer lg:hidden"
          >
            <div className="rounded-lg border border-gray-500 p-2 dark:border-neutral-700">
              <RiMenu3Line
                className={`text-pr text-lg text-primary dark:text-tertiary ${!props?.sidebarOpen ? "-rotate-180" : ""} `}
              />
            </div>
          </div>
          {/* <!-- Hamburger Toggle BTN --> */}
        </div>
        <div
          onClick={props.setFullWidth}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              props.setFullWidth();
            }
          }}
          role="button"
          tabIndex={0}
          className="hidden w-fit cursor-pointer lg:block"
        >
          <div className="rounded-lg border border-gray-500 p-2 dark:border-neutral-700">
            <RiMenu3Line
              className={`text-pr text-lg text-primary dark:text-tertiary ${props?.fullWidth ? "-rotate-180" : ""} `}
            />
          </div>
        </div>
        <ul className="flex w-fit items-center gap-7">
          <DarkModeSwitcher />
          <DropdownUser />
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
