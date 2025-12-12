"use client";
import usePermission from "@/shared/hooks/usePermission";
import {
  removeFromLocalStorage,
  saveToLocalStorage,
  setLocalStorageItem
} from "@/shared/utils";
import { useAuth, useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { useRouter } from "nextjs-toploader/app";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
const AccountSelection = dynamic(() => import("./AccountSelection"), {
  ssr: false
});
const InitialLoading = dynamic(() => import("./InitialLoading"), {
  ssr: false
});
const ErrorComponent = dynamic(() => import("./ErrorComponent"), {
  ssr: false
});
const Verification = dynamic(() => import("./Verification"), {
  ssr: false
});
const VERIFICATION_TIMEOUT = 30000;

export interface Account {
  partnership_id: string;
  tenant_id: string;
  client_id: string;
  valid_upto: string;
  client_name: string;
}

interface ApiResponse {
  multi_account?: boolean;
  accounts?: Account[];
}

type AuthState =
  | "initializing"
  | "checking_auth"
  | "selecting_account"
  | "verifying_user"
  | "complete"
  | "error";

const UnifiedAuth = () => {
  const { setUser } = usePermission();
  const { getToken, signOut } = useAuth();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>("initializing");
  const [accountLoading, setAccountLoading] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [multiAccount, setMultiAccount] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationState, setVerificationState] = useState("idle");
  const [currentStep, setCurrentStep] = useState(0);

  const currentRef = useRef<boolean>(false);
  const attemptCountRef = useRef(0);
  const verifyUser = useCallback(async () => {
    if (verificationState !== "idle" && authState !== "verifying_user") {
      return;
    }

    setVerificationState("pending");
    attemptCountRef.current += 1;
    setCurrentStep(1);

    try {
      let token;
      try {
        setCurrentStep(2);
        token = await getToken({ template: "token-for-testing" });

        if (!token) {
          token = await getToken({ template: "token-for-testing" });
        }

        if (!token) {
          throw new Error("Authentication failed");
        }
      } catch {
        throw new Error("Authentication token error");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        VERIFICATION_TIMEOUT
      );

      setCurrentStep(3);

      const res = await fetch("/api/cv/v1/auth-user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.status === 401) {
        removeFromLocalStorage("ACCESS_TOKEN");
        setUser({});
        setAuthState("error");
        setError("Unauthorized");
        signOut();
        router.push("/auth/signin");
        return;
      }

      if (res.status === 200) {
        const response = await res.json();
        setUser(response ?? {});
        saveToLocalStorage("ACCESS_TOKEN", token);
        localStorage.setItem(
          "DATETIMEFORMAT",
          JSON.stringify(response?.data_time)
        );
        setVerificationState("success");
        setCurrentStep(4);
        setAuthState("complete");

        if (response?.resources?.landing_page?.trust_center_view) {
          router.push("/self-assessment/trust-center");
        } else if (response?.resources?.landing_page?.rai_view) {
          router.push("/self-assessment/responsible-ai");
        } else if (response?.trust_center_generate) {
          router.push("/self-assessment/generate-trust-center");
        } else if (response?.subscription_status?.is_subscription_ended) {
          signOut();
          toast.info(response?.subscription_status?.status_message);
          router.push("/");
        } else {
          router.push("/");
        }
      } else {
        removeFromLocalStorage("ACCESS_TOKEN");
        setUser({});
        setAuthState("error");
        setError(`Server returned status: ${res.status}`);
        signOut();
        router.push("/auth/signin");
      }
    } catch (err: unknown) {
      setAuthState("error");
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Verification timed out"
          : "Verification failed"
      );
      setVerificationState("idle");
      setCurrentStep(0);
    }
  }, [getToken, setUser, router, verificationState, authState]);

  const checkInitialAuth = useCallback(async () => {
    if (currentRef.current) {
      return;
    }

    try {
      setAuthState("checking_auth");
      setError(null);
      currentRef.current = true;

      let token = await getToken({ template: "token-for-testing" });
      if (!token) {
        token = await getToken({ template: "token-for-testing" });
      }

      if (!token) {
        throw new Error("Authentication failed. Please try again.");
      }

      const res = await fetch("/api/cv/v1/auth-check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (res?.ok && res?.status === 200) {
        const data: ApiResponse = await res.json();
        const isMultiAccount = data?.multi_account ?? false;
        const accountsList = data?.accounts ?? [];

        if (!isMultiAccount && accountsList?.length === 0) {
          setAuthState("verifying_user");
          await verifyUser();
        } else {
          setAuthState("selecting_account");
          setMultiAccount(isMultiAccount);
          setAccounts(accountsList);
          setFilteredAccounts(accountsList);
        }
      } else {
        const errorText = await res?.text?.().catch(() => "Unknown error");
        throw new Error(`Failed to fetch account details: ${errorText}`);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      setAuthState("error");
      toast.error(errorMessage);
    }
  }, [getToken]);

  const handleSetToAccount = useCallback(
    async (partnershipId: string) => {
      try {
        setAccountLoading(partnershipId);

        let token = await getToken({ template: "token-for-testing" });
        if (!token) {
          token = await getToken({ template: "token-for-testing" });
        }

        if (!token) {
          throw new Error("Authentication failed. Please try again.");
        }

        const res = await fetch(
          `/api/cv/v1/auth-set-account?partnership_id=${partnershipId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res?.ok && (res?.status === 200 || res?.status === 201)) {
          setAuthState("verifying_user");
          await verifyUser();
        } else {
          const errorText = await res?.text?.().catch(() => "Unknown error");
          throw new Error(`Failed to set account: ${errorText}`);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        toast.error(errorMessage);
        setAccountLoading(null);
      }
    },
    [getToken]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredAccounts(accounts);
        return;
      }

      const filtered = accounts.filter((account) => {
        const searchTerm = query.toLowerCase();
        return (
          account.client_name?.toLowerCase().includes(searchTerm) ||
          account.client_id?.toLowerCase().includes(searchTerm) ||
          account.tenant_id?.toLowerCase().includes(searchTerm) ||
          account.partnership_id?.toLowerCase().includes(searchTerm)
        );
      });

      setFilteredAccounts(filtered);
    },
    [accounts]
  );

  const fetchIPDetails = useCallback(async () => {
    try {
      const res = await fetch("https://ipinfo.io/json");
      if (res.ok) {
        const data = await res.json();
        setLocalStorageItem("IPINFO", data);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch IP details"
      );
    }
  }, []);

  const handleReset = useCallback(() => {
    setAuthState("initializing");
    setVerificationState("idle");
    attemptCountRef.current = 0;
    currentRef.current = false;
    setCurrentStep(0);
    setError(null);
    checkInitialAuth();
    fetchIPDetails();
  }, [checkInitialAuth, fetchIPDetails]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [accounts, handleSearch, searchQuery]);

  useEffect(() => {
    if (!isUserLoaded || !isSignedIn) {
      return;
    }
    if (authState !== "initializing") {
      return;
    }

    checkInitialAuth();
    fetchIPDetails();
  }, [isUserLoaded, isSignedIn, authState, checkInitialAuth, fetchIPDetails]);

  const renderContent = () => {
    switch (authState) {
      case "initializing":
      case "checking_auth":
        return <InitialLoading />;

      case "selecting_account":
        return (
          <AccountSelection
            multiAccount={multiAccount}
            accounts={accounts}
            filteredAccounts={filteredAccounts}
            searchQuery={searchQuery}
            accountLoading={accountLoading}
            handleSearch={handleSearch}
            handleSetToAccount={handleSetToAccount}
            handleReset={handleReset}
          />
        );

      case "verifying_user":
        return <Verification currentStep={currentStep} />;

      case "error":
        return (
          <ErrorComponent errors={error as string} handleReset={handleReset} />
        );

      default:
        return <InitialLoading />;
    }
  };

  return renderContent();
};

// Custom animations CSS
const customAnimations = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes ping-slow {
  0% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.5); opacity: 0.1; }
  100% { transform: scale(1); opacity: 0.2; }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shine {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.animate-blob {
  animation: blob 7s infinite alternate;
}

.animate-ping-slow {
  animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-gradient-x {
  animation: gradient-x 3s ease infinite;
  background-size: 200% 200%;
}

.animate-shine {
  animation: shine 2s infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
`;
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.id = "unified-auth-animations";
  if (!document.getElementById(styleEl.id)) {
    styleEl.textContent = customAnimations;
    document.head.appendChild(styleEl);
  }
}

export default UnifiedAuth;
