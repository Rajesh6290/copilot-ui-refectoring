import CustomButton from "@/shared/core/CustomButton";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { Copy, HelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Share = ({
  open,
  onClose,
  documentTitle = "NIST Playbook"
}: {
  open: boolean;
  onClose: () => void;
  documentTitle?: string;
}) => {
  const [tabValue, setTabValue] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([null, null, null]);
  const [underlineStyle, setUnderlineStyle] = useState({
    left: 0,
    width: 0
  });

  // Update the underline position and width when tab changes
  useEffect(() => {
    const activeTab = tabsRef.current[tabValue];
    if (activeTab) {
      setUnderlineStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth
      });
    }
  }, [tabValue]);

  // Initialize underline position when component mounts
  useEffect(() => {
    const activeTab = tabsRef.current[tabValue];
    if (activeTab) {
      setUnderlineStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth
      });
    }
  }, [tabValue]);

  const handleTabChange = (index: number) => {
    setTabValue(index);
  };

  const users = [
    {
      name: "Admin Cognitiveview",
      email: "admin@cognitiveview.com",
      role: "Editor",
      avatar: "A"
    },
    {
      name: "Ashutosh Padhi",
      email: "ashutosh@cognitiveview.com",
      role: "Editor",
      avatar: "A"
    },
    {
      name: "Bishnutosh Panda",
      email: "bishnutosh@cognitiveview.com",
      role: "Editor",
      avatar: "B"
    },
    {
      name: "Dilin Mohapatra",
      email: "dilin@cognitiveview.com",
      role: "Editor",
      avatar: "D"
    }
  ];

  return (
    <Dialog
      open={open}
      // onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="rounded-lg"
    >
      <DialogTitle className="flex items-center justify-between border-b pb-4">
        <div className="text-xl font-normal">Share {`"${documentTitle}"`}</div>
        <button className="rounded-full p-2 hover:bg-gray-100">
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </button>
      </DialogTitle>

      <DialogContent className="p-0">
        <div className="py-2">
          <div className="mb-6 px-4">
            <input
              type="text"
              placeholder="Add people, groups, and calendar events"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>

          <div className="mb-2 mt-3 px-4 font-medium">People with access</div>

          <div className="mb-4 border-b border-gray-200 px-4">
            <div className="relative flex">
              <button
                ref={(el) => {
                  tabsRef.current[0] = el;
                }}
                onClick={() => handleTabChange(0)}
                className={`px-4 py-2 font-medium focus:outline-none ${
                  tabValue === 0
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                ref={(el) => {
                  tabsRef.current[1] = el;
                }}
                onClick={() => handleTabChange(1)}
                className={`px-4 py-2 font-medium focus:outline-none ${
                  tabValue === 1
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Members
              </button>
              <button
                ref={(el) => {
                  tabsRef.current[2] = el;
                }}
                onClick={() => handleTabChange(2)}
                className={`px-4 py-2 font-medium focus:outline-none ${
                  tabValue === 2
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Groups
              </button>

              {/* Sliding underline */}
              <div
                className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-in-out"
                style={{
                  left: `${underlineStyle.left}px`,
                  width: `${underlineStyle.width}px`
                }}
              />
            </div>
          </div>

          {/* Scrollable user list container */}
          <div className="max-h-84 overflow-y-auto px-4">
            <ul className="flex flex-col gap-3 px-0">
              {users.map((user, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${
                        user.avatar === "S"
                          ? "bg-blue-600"
                          : user.avatar === "A"
                            ? "bg-orange-500"
                            : user.avatar === "B"
                              ? "bg-gray-600"
                              : user.avatar === "M"
                                ? "bg-green-500"
                                : user.avatar === "J"
                                  ? "bg-purple-500"
                                  : "bg-pink-500"
                      } text-white`}
                    >
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-gray-500">{user.role}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="border-t p-4">
        <button className="mr-auto flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
          <Copy className="mr-2 h-4 w-4" />
          Copy link
        </button>
        <CustomButton onClick={onClose}>DONE</CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default Share;
