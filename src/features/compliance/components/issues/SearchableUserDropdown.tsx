"use client";
import { Check, ChevronDown, Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "./AddEditIssue";

// User interface - Updated to match API response
interface User {
  user_id: string;
  email_id: string;
  first_name: string;
  last_name: string | null;
  user_name: string;
  role: string;
  role_id: string;
  clerk_user_id: string;
  tenant_id: string;
  client_id: string;
  user_groups: string[];
  allowed_sensitivity: boolean;
  created_at: string;
  updated_at: string;
  db: string;
}

const SearchableUserDropdown = ({
  value,
  onChange,
  onSearchChange,
  users,
  error,
  isLoading
}: {
  value: {
    email: string;
    user_id: string;
    username: string;
    role: string;
  };
  onChange: (value: {
    email: string;
    user_id: string;
    username: string;
    role: string;
  }) => void;
  onSearchChange: (search: string) => void;
  users: User[];
  error?: string;
  isLoading?: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Call API when debounced search term changes
  useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  // Filter users based on search term (client-side filtering for immediate feedback)
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return users;
    }
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term) ||
        user.email_id.toLowerCase().includes(term) ||
        user.user_name.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Set selected user when value changes - Updated for new structure
  useEffect(() => {
    if (value?.user_id === "other") {
      setSelectedUser({
        user_id: "other",
        email_id: "other",
        first_name: "Others",
        last_name: "",
        user_name: "other",
        role: "External"
      } as User);
    } else if (value?.user_id) {
      const user = users.find((u) => u.user_id === value.user_id);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [value, users]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Updated handleSelect to use new payload structure
  const handleSelect = (user: User) => {
    const assignedToValue = {
      email: user.email_id,
      user_id: user.user_id,
      username: user.user_name || user.first_name,
      role: user.role
    };

    onChange(assignedToValue);
    setSelectedUser(user);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredUsers.length ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredUsers.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex === filteredUsers.length) {
            // Select "Others" option
            handleSelect({
              user_id: "other",
              email_id: "other",
              first_name: "Others",
              last_name: "",
              user_name: "other",
              role: "other"
            } as User);
          } else if (filteredUsers[highlightedIndex]) {
            handleSelect(filteredUsers[highlightedIndex]);
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const displayText = selectedUser
    ? selectedUser.user_id === "other"
      ? "Others"
      : `${selectedUser.first_name} ${selectedUser.last_name || ""}`.trim()
    : "Select assignee";

  const displayEmail =
    selectedUser?.user_id === "other"
      ? "External assignment"
      : selectedUser?.email_id || "";

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        tabIndex={0}
        role="button"
        className={`w-full rounded-xl border ${
          error
            ? "border-red-500 ring-1 ring-red-500"
            : isOpen
              ? "border-[#4f46e5] ring-2 ring-[#4f46e5]/20"
              : "border-[#e2e8f0] hover:border-[#4f46e5]/60"
        } cursor-pointer bg-white transition-all duration-200 dark:border-neutral-800 dark:bg-darkMainBackground`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0 flex-1">
            {selectedUser ? (
              <div>
                <div className="truncate font-medium text-gray-900 dark:text-white">
                  {displayText}
                </div>
                {displayEmail && (
                  <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {displayEmail}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                {displayText}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedUser && (
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white ${
                  selectedUser.user_id === "other"
                    ? "bg-gradient-to-r from-gray-500 to-gray-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                }`}
              >
                {selectedUser.user_id === "other" ? (
                  <Search className="h-3 w-3" />
                ) : (
                  selectedUser.first_name?.[0]?.toUpperCase() || "U"
                )}
              </div>
            )}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="animate-in slide-in-from-top-2 absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-2xl duration-200 dark:border-neutral-700 dark:bg-darkMainBackground">
          {/* Enhanced Search input */}
          <div className="border-b border-[#e2e8f0] bg-gray-50 p-3 dark:border-neutral-700 dark:bg-darkSidebarBackground">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full rounded-lg border border-[#e2e8f0] py-2 pl-10 pr-4 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#4f46e5]"></div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced User list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredUsers.length > 0 || !searchTerm ? (
              <>
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.user_id}
                    tabIndex={0}
                    role="button"
                    className={`group cursor-pointer border-b border-gray-100 px-4 py-2.5 transition-all duration-150 dark:border-gray-700 ${
                      highlightedIndex === index
                        ? "bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                    onClick={() => handleSelect(user)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSelect(user);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Compact Avatar */}
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-medium text-white">
                        {user.first_name?.[0]?.toUpperCase() || "U"}
                      </div>

                      {/* Compact User info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name || ""}
                          </span>
                          <span className="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {user.role}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          {user.email_id}
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {value?.user_id === user.user_id && (
                        <div className="flex-shrink-0">
                          <Check className="h-4 w-4 text-[#4f46e5]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Others option - Compact */}
                <div
                  tabIndex={0}
                  role="button"
                  className={`group cursor-pointer border-t border-gray-200 px-4 py-2.5 transition-all duration-150 dark:border-gray-600 ${
                    highlightedIndex === filteredUsers.length
                      ? "bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={() =>
                    handleSelect({
                      user_id: "other",
                      email_id: "other",
                      first_name: "Others",
                      last_name: "",
                      user_name: "other",
                      role: "other"
                    } as User)
                  }
                  onMouseEnter={() => setHighlightedIndex(filteredUsers.length)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSelect({
                        user_id: "other",
                        email_id: "other",
                        first_name: "Others",
                        last_name: "",
                        user_name: "other",
                        role: "other"
                      } as User);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Others Avatar - Compact */}
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                      <Search className="h-3 w-3" />
                    </div>

                    {/* Others info - Compact */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Others
                        </span>
                        <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          External
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        External person or team member
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {value?.user_id === "other" && (
                      <div className="flex-shrink-0">
                        <Check className="h-4 w-4 text-[#4f46e5]" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4 py-8 text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#4f46e5]"></div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Searching users...
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    <Search className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    <p>No users found</p>
                    <p className="mt-1 text-xs">
                      Try adjusting your search terms
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer info */}
          {(filteredUsers.length > 0 || !searchTerm) && (
            <div className="border-t border-[#e2e8f0] bg-gray-50 px-3 py-2 dark:border-neutral-700 dark:bg-darkSidebarBackground">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""} • Use ↑↓ to navigate,
                Enter to select
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default SearchableUserDropdown;
