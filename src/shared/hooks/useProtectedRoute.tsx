"use client";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Loader from "../common/Loader";
import { Feature, FeatureGroup, SubFeature } from "../types/user";
import { removeFromLocalStorage } from "../utils";
import useMenuItems from "./useMenuItems";
import usePermission from "./usePermission";

/**
 * Higher-order component that protects routes based on user permissions.
 * Clerk handles authentication only, backend handles authorization.
 * @param PassedComponent The component to wrap with route protection
 * @returns A new component with route protection
 */
const UseProtectedRoutes = <P extends object>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PassedComponent: ComponentType<P>
) => {
  function ProtectedRouteComponent(props: P) {
    const asPath = usePathname();
    const { user, isLoaded } = useUser();
    const { push } = useRouter();
    const { signOut } = useClerk();
    const { getToken } = useAuth();
    const { isUserLoading, menuItems } = useMenuItems();
    const [tokenLoading, setTokenLoading] = useState<boolean>(true);
    const { user: loggedUser, isUserLoading: loggedUserLoading } =
      usePermission();

    // Use refs to track component state and prevent duplicate toasts
    const mounted = useRef<boolean>(false);
    const unauthorizedToastShown = useRef<boolean>(false);

    // Track authorization state
    const [hasValidatedAccess, setHasValidatedAccess] =
      useState<boolean>(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    // Routes that don't need authentication at all (public routes)
    const publicRoutes = useMemo<string[]>(
      () => ["/auth/signin", "/auth/signup"],
      []
    );

    // Routes that should always be allowed for authenticated users
    const alwaysAllowedRoutes = useMemo<RegExp[]>(
      () => [
        /^\/c\/.+$/, // Routes like /c/anything...
        /^\/api\/.+$/, // API routes
        /^\/auth\/.+$/ // Auth routes
      ],
      []
    );

    // Check if the current path is public
    const isPublicRoute = publicRoutes.includes(asPath || "");

    // Check if the current path is in the always-allowed list
    const isAlwaysAllowed = useMemo<boolean>(() => {
      if (!asPath) {
        return false;
      }
      return alwaysAllowedRoutes.some((pattern) => pattern.test(asPath));
    }, [asPath, alwaysAllowedRoutes]);

    useEffect(() => {
      // Fetch and store token for authenticated users
      const fetchToken = async () => {
        if (user?.id) {
          setTokenLoading(true);
          const token = await getToken({ template: "token-for-testing" });
          if (token) {
            localStorage.setItem("ACCESS_TOKEN", token);
          }
          setTokenLoading(false);
        }
      };

      fetchToken();
    }, [user, getToken]);

    // Clean up any hash URLs that might have been created by routing conflicts
    useEffect(() => {
      const currentUrl = window.location.href;
      if (currentUrl.includes("#/sign-in")) {
        window.history.replaceState(null, "", "/auth/signin");
      }
      if (currentUrl.includes("#/sign-up")) {
        window.history.replaceState(null, "", "/auth/signup");
      }
    }, []);

    /**
     * Check if all feature groups and their features are hidden
     */
    function areAllMenusHidden(featureGroups: FeatureGroup[]): boolean {
      return featureGroups.every((group: FeatureGroup) => {
        if (!group?.permission?.is_shown) {
          return true;
        }
        return group.features?.every((feature: Feature) => {
          if (!feature?.permission?.is_shown) {
            return true;
          }
          if (feature.sub_features?.length) {
            return feature.sub_features.every(
              (subFeature: SubFeature) => !subFeature.permission?.is_shown
            );
          }
          return true;
        });
      });
    }

    /**
     * Check if a path is explicitly defined as a hidden route
     */
    function isHiddenRoute(
      featureGroups: FeatureGroup[],
      currentPath: string
    ): boolean {
      for (const group of featureGroups) {
        for (const feature of group.features || []) {
          // Direct match on route
          if (
            feature.metadata?.route === currentPath &&
            !feature.permission?.is_shown
          ) {
            return true;
          }

          // Check sub-features
          if (feature.sub_features) {
            for (const subFeature of feature.sub_features) {
              if (
                subFeature.metadata?.route === currentPath &&
                (!feature.permission?.is_shown ||
                  !subFeature.permission?.is_shown)
              ) {
                return true;
              }
            }
          }
        }
      }
      return false;
    }

    /**
     * Helper function to check access through menu hierarchy
     * @param featureGroups The feature groups to check
     * @param currentPath The current path to validate
     * @returns Whether access is granted
     */
    function checkMenuAccess(
      featureGroups: FeatureGroup[],
      currentPath: string
    ): boolean {
      // Early return if no feature groups
      if (!featureGroups || featureGroups.length === 0) {
        return false;
      }

      return featureGroups.some((group: FeatureGroup) => {
        // Skip groups that aren't shown
        if (!group?.permission?.is_shown) {
          return false;
        }
        return group.features?.some((feature: Feature) => {
          // Skip features that aren't shown
          if (!feature?.permission?.is_shown) {
            return false;
          }

          // Check sub-features if this feature has them
          if (
            feature?.metadata?.route === "" &&
            (feature?.sub_features?.length ?? 0) > 0
          ) {
            return feature.sub_features?.some((subFeature: SubFeature) => {
              const subFeaturePath = subFeature.metadata?.route;
              const isSubFeatureMatching =
                currentPath === subFeaturePath ||
                currentPath.startsWith(`${subFeaturePath}/`);
              const isSubFeatureShown =
                subFeature.permission?.is_shown === true;
              const canRead = feature.permission?.actions?.read === true;

              return isSubFeatureMatching && isSubFeatureShown && canRead;
            });
          }

          // Check direct routes
          const featureRoute = feature.metadata?.route;
          const isExactMatch = currentPath === featureRoute;
          const isNestedMatch =
            featureRoute !== "" &&
            featureRoute !== "#" &&
            currentPath.startsWith(`${featureRoute}/`);
          const canRead = feature.permission?.actions?.read === true;

          return (isExactMatch || isNestedMatch) && canRead;
        });
      });
    }

    // Main authorization logic
    useEffect(() => {
      mounted.current = true;

      // Allow public routes without any authentication
      if (isPublicRoute) {
        setIsAuthorized(true);
        setHasValidatedAccess(true);
        return;
      }

      // Wait for Clerk to load
      if (!isLoaded) {
        return;
      }

      // If no user is authenticated, redirect to sign-in
      if (!user?.id) {
        push("/auth/signin");
        removeFromLocalStorage("ACCESS_TOKEN");
        return;
      }

      // Allow always-allowed routes for authenticated users
      if (isAlwaysAllowed) {
        setIsAuthorized(true);
        setHasValidatedAccess(true);
        return;
      }

      // Wait for backend authorization data to load
      if (isUserLoading || loggedUserLoading || !loggedUser) {
        return;
      }

      // Check subscription status
      if (loggedUser?.subscription_status?.is_subscription_ended) {
        signOut();
        toast.warning(
          loggedUser?.subscription_status?.status_message ||
            "Subscription ended"
        );
        return;
      }

      // Handle trust center generation redirect
      if (loggedUser?.resources?.landing_page?.trust_center_view) {
        push("/self-assessment/trust-center");
        setIsAuthorized(true);
        setHasValidatedAccess(true);
        return;
      }
      if (loggedUser?.resources?.landing_page?.rai_view) {
        push("/self-assessment/responsible-ai");
        setIsAuthorized(true);
        setHasValidatedAccess(true);
        return;
      }

      // Check permissions when we have menu items
      if (Array.isArray(menuItems) && menuItems.length > 0) {
        // Check if all menu items are hidden
        const allMenusHidden = areAllMenusHidden(menuItems);

        // If all menus are hidden and trust_center_generate is true, redirect
        if (allMenusHidden && loggedUser.trust_center_generate === true) {
          push("/self-assessment/generate-trust-center");
          setIsAuthorized(true);
          setHasValidatedAccess(true);
          return;
        }

        // Check if the "assistant" feature group is shown (for dynamic routes)
        const isAssistantMenuShown = menuItems.some(
          (group: FeatureGroup) =>
            group?.metadata?.reference === "assistant" &&
            group?.permission?.is_shown === true
        );

        // Test if current path is a top-level dynamic route
        const isDynamicTopLevelRoute = /^\/[^/]+$/.test(asPath || "");

        // Handle access check through menu hierarchy
        const hasMenuAccess = checkMenuAccess(menuItems, asPath || "");

        // Combine all access rules
        const hasAccess =
          isAlwaysAllowed ||
          hasMenuAccess ||
          (isAssistantMenuShown &&
            isDynamicTopLevelRoute &&
            !isHiddenRoute(menuItems, asPath || ""));

        // Show unauthorized message and redirect if no access
        if (!hasAccess && !unauthorizedToastShown.current) {
          unauthorizedToastShown.current = true;
          toast.info("Unauthorized Access!");
          signOut();
          push("/auth/signin");
        }

        setIsAuthorized(hasAccess);
        setHasValidatedAccess(true);
      }

      return () => {
        mounted.current = false;
      };
    }, [
      user?.id, // Only watch user ID, not entire user object
      push,
      asPath,
      isLoaded,
      signOut,
      isUserLoading,
      loggedUserLoading,
      loggedUser?.client_id, // Only watch client_id, not entire user
      loggedUser?.subscription_status?.is_subscription_ended, // Only watch subscription status
      loggedUser?.trust_center_generate, // Only watch specific flags
      menuItems?.length, // Only watch array length, not entire array
      isPublicRoute,
      isAlwaysAllowed
    ]);

    if (tokenLoading) {
      return <Loader />;
    }

    // Show loader during loading states
    if (
      !hasValidatedAccess ||
      (!isPublicRoute &&
        (!isLoaded || !user?.id || isUserLoading || loggedUserLoading))
    ) {
      return <Loader />;
    }

    // Show loader if access validation is complete but unauthorized
    if (hasValidatedAccess && !isAuthorized) {
      return <Loader />;
    }

    // Render the protected component if authorized
    return <PassedComponent {...props} />;
  }

  // Display name for dev tools
  const componentName =
    PassedComponent.displayName || PassedComponent.name || "Component";
  ProtectedRouteComponent.displayName = `Protected(${componentName})`;

  return ProtectedRouteComponent;
};

export default UseProtectedRoutes;
