"use client";
import ClickOutside from "@/shared/common/ClickOutside";
import usePermission from "@/shared/hooks/usePermission";
import { removeFromLocalStorage } from "@/shared/utils";
import { useClerk, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Loader2, LogOut, Mail, User } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface MenuItemType {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  action: () => void;
  color: string;
  badge?: string;
}
const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { logout } = usePermission();
  const userData = useMemo(() => {
    if (!user) {
      return null;
    }

    const getUserRole = () => {
      if (user.publicMetadata["role"]) {
        return user.publicMetadata["role"] as string;
      }
      if (user.publicMetadata["subscription"]) {
        return user.publicMetadata["subscription"] as string;
      }
      return "Free User";
    };

    const getJoinDate = () => {
      if (user.createdAt) {
        return new Date(user.createdAt).getFullYear();
      }
      return new Date().getFullYear();
    };

    const getDisplayName = () => {
      return user.fullName || user.firstName || user.username || "User";
    };

    const getUserEmail = () => {
      return (
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        "No email"
      );
    };

    const getUserAvatar = () => {
      return user.imageUrl || null;
    };

    const getUserInitials = () => {
      const name = getDisplayName();
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    return {
      role: getUserRole(),
      joinDate: getJoinDate(),
      displayName: getDisplayName(),
      email: getUserEmail(),
      avatar: getUserAvatar(),
      initials: getUserInitials(),
      verified: user.publicMetadata["verified"] as boolean,
      stats: {
        projectsCount: (user.publicMetadata["projectsCount"] as string) || "0",
        tasksCompleted:
          (user.publicMetadata["tasksCompleted"] as string) || "0",
        teamMembers: (user.publicMetadata["teamMembers"] as string) || "0"
      },
      unreadNotifications: user.publicMetadata["unreadNotifications"] as string
    };
  }, [user]);

  const menuItems: MenuItemType[] = useMemo(
    () => [
      {
        icon: User,
        label: "My Profile",
        description: "View and edit your profile",
        action: () => openUserProfile(),
        color: "text-blue-600 dark:text-blue-400"
      }
    ],
    [openUserProfile, userData?.unreadNotifications]
  );

  const handleDropdownToggle = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const handleDropdownClose = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut({ redirectUrl: "/auth/signin" });
      logout();
      removeFromLocalStorage("ACCESS_TOKEN");
      setDropdownOpen(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error signing out. Please try again."
      );
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut]);

  const handleMenuItemClick = useCallback((action: () => void) => {
    action();
    setDropdownOpen(false);
  }, []);
  if (!isLoaded) {
    return (
      <div className="flex animate-pulse items-center gap-3">
        <div className="hidden flex-col items-end gap-1 sm:flex">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  const Avatar = ({
    size = "h-10 w-10",
    showFallback = true
  }: {
    size?: string;
    showFallback?: boolean;
  }) => (
    <div
      className={`${size} flex items-center justify-center overflow-hidden rounded-full border-2 border-tertiary-200 bg-gradient-to-br from-tertiary-500 to-tertiary-600 dark:border-tertiary-700`}
    >
      {userData.avatar ? (
        <img
          src={userData.avatar}
          alt={userData.displayName}
          className="h-full w-full object-cover"
          onError={(e) => {
            if (showFallback) {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.classList.remove("hidden");
              }
            }
          }}
        />
      ) : null}
      <div
        className={`flex h-full w-full items-center justify-center text-sm font-semibold text-white ${userData.avatar ? "hidden" : ""}`}
      >
        {userData.initials}
      </div>
    </div>
  );

  return (
    <ClickOutside onClick={handleDropdownClose} className="relative">
      <motion.div
        onClick={handleDropdownToggle}
        className="flex cursor-pointer items-center gap-3 rounded-xl transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-darkMainBackground"
      >
        <div className="hidden flex-col items-end sm:flex">
          <span className="block text-sm font-semibold text-gray-900 dark:text-white">
            {userData.displayName}
          </span>
          <span className="block max-w-[150px] truncate text-xs text-gray-500 dark:text-gray-400">
            {userData.email}
          </span>
        </div>

        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Avatar />
          </motion.div>

          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></div>
        </div>
      </motion.div>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full z-50 mt-4 w-80 origin-top-right"
          >
            <div className="rounded-xl border border-gray-200/50 bg-white/95 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground dark:shadow-black/20">
              <div className="border-b border-gray-100 p-4 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <Avatar size="h-12 w-12" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                      {userData.displayName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{userData.email}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>Member since {userData.joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMenuItemClick(item.action)}
                    className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-colors duration-200 group-hover:bg-white dark:bg-darkMainBackground dark:group-hover:bg-darkHoverBackground">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="border-t border-gray-100 p-2 dark:border-neutral-800">
                <motion.button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={`group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 ${
                    isSigningOut
                      ? "cursor-not-allowed bg-red-50 opacity-75 dark:bg-red-900/20"
                      : "hover:bg-red-50 dark:hover:bg-red-900/20"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 ${
                      isSigningOut
                        ? "bg-red-200 dark:bg-red-900/50"
                        : "bg-red-100 group-hover:bg-red-200 dark:bg-red-900/30 dark:group-hover:bg-red-900/50"
                    }`}
                  >
                    {isSigningOut ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600 dark:text-red-400" />
                    ) : (
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {isSigningOut ? "Signing Out..." : "Sign Out"}
                    </span>
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {isSigningOut
                        ? "Please wait..."
                        : "Sign out of your account"}
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClickOutside>
  );
};

export default DropdownUser;
