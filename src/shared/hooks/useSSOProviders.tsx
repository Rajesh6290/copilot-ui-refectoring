"use client";

import { useClerk } from "@clerk/nextjs";
import { JSX, useEffect, useMemo, useState } from "react";

interface SSOProvider {
  id: string;
  name: string;
  icon: JSX.Element;
}

interface SocialProviderSettings {
  enabled: boolean;
  strategy: string;
}

interface ClerkEnvironment {
  userSettings?: {
    social?: Record<string, SocialProviderSettings>;
  };
}

interface ClerkWithEnvironment {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __unstable__environment?: ClerkEnvironment;
  environment?: ClerkEnvironment;
}

const useSSOProviders = () => {
  const { loaded: isLoaded } = useClerk();
  const clerk = useClerk();
  const [availableStrategies, setAvailableStrategies] = useState<string[]>([]);

  // 1. Fetch enabled strategies from Clerk Environment
  useEffect(() => {
    if (isLoaded && clerk) {
      // Accessing internal Clerk environment to get social settings before user login
      const env =
        (clerk as ClerkWithEnvironment).__unstable__environment ||
        (clerk as ClerkWithEnvironment).environment;

      const socialSettings = env?.userSettings?.social;

      if (socialSettings) {
        const enabledStrategies = Object.values(socialSettings)
          .filter((p: SocialProviderSettings) => p.enabled)
          .map((p: SocialProviderSettings) => p.strategy);

        setAvailableStrategies(enabledStrategies);
      }
    }
  }, [isLoaded, clerk]);

  // 2. Map strategies to Icons
  return useMemo(() => {
    const providers: SSOProvider[] = [];

    // Helper to conditionally add providers
    const add = (id: string, name: string, icon: JSX.Element) => {
      if (availableStrategies.includes(id)) {
        providers.push({ id, name, icon });
      }
    };

    // ===========================
    // SOCIAL OAUTH PROVIDERS
    // ===========================

    // Google
    add(
      "oauth_google",
      "Google",
      <svg className="h-5 w-5" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.85-6.85C35.9 1.82 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.4 13.36 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.1 24.55c0-1.57-.15-3.08-.42-4.55H24v9.02h12.8c-.55 2.9-2.19 5.34-4.66 6.98l7.37 5.7C43.22 37.26 46.1 31.28 46.1 24.55z"
        />
        <path
          fill="#FBBC05"
          d="M10.54 28.41c-.48-1.43-.75-2.96-.75-4.41s.27-2.98.75-4.41l-7.98-6.18C1.23 16.93 0 20.35 0 24s1.23 7.07 3.56 10.59l7.98-6.18z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.9-5.76l-7.37-5.7c-2.04 1.37-4.69 2.16-8.53 2.16-6.26 0-11.6-3.86-13.46-9.91l-7.98 6.18C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
    );

    // GitHub
    add(
      "oauth_github",
      "GitHub",
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.42 7.86 10.96.58.11.79-.25.79-.56v-2.1c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.3-1.68-1.3-1.68-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.21 1.79 1.21 1.04 1.77 2.73 1.26 3.4.96.1-.76.41-1.26.74-1.55-2.56-.29-5.26-1.28-5.26-5.67 0-1.25.46-2.27 1.21-3.07-.12-.3-.53-1.52.11-3.17 0 0 .99-.32 3.24 1.18A11.3 11.3 0 0 1 12 6.8c1 .01 2.01.13 2.96.38 2.24-1.5 3.23-1.18 3.23-1.18.65 1.65.24 2.87.12 3.17.76.8 1.2 1.82 1.2 3.07 0 4.41-2.71 5.37-5.29 5.66.42.36.8 1.08.8 2.18v3.24c0 .31.21.68.79.56A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    );

    // Microsoft
    add(
      "oauth_microsoft",
      "Microsoft",
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <rect width="11" height="11" x="0" y="0" fill="#F25022" />
        <rect width="11" height="11" x="13" y="0" fill="#00A4EF" />
        <rect width="11" height="11" x="0" y="13" fill="#7FBA00" />
        <rect width="11" height="11" x="13" y="13" fill="#FFB900" />
      </svg>
    );

    // Apple
    add(
      "oauth_apple",
      "Apple",
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.7 1.3c0 1-0.4 1.9-1.1 2.6-0.8 0.8-1.7 1.2-2.7 1.2-0.1-1 .3-1.9 1-2.7S15.7 1 16.7 1.3zM21.4 17.3c-.4 1-1 2.2-1.8 3.5-.9 1.3-1.7 2.3-2.5 2.9-.8.6-1.6.9-2.4.9-.6 0-1.3-.2-2-.5-.8-.3-1.3-.5-1.6-.5-.4 0-.9.2-1.6.5-.7.3-1.3.5-1.9.5-.8 0-1.6-.3-2.4-.9-.8-.6-1.6-1.6-2.5-2.9-.9-1.3-1.5-2.4-1.9-3.5-.4-1.1-.6-2.2-.6-3.2 0-1.8.6-3.4 1.8-4.7 1.1-1.2 2.5-1.9 4.1-2 0.6 0 1.4.2 2.2.5.8.3 1.3.5 1.6.5.3 0 .9-.2 1.6-.5.7-.3 1.4-.5 2-.5 1.4 0 2.7.7 3.9 2 1.2 1.3 1.8 2.9 1.8 4.7-.1 1.1-.3 2.2-.7 3.3z" />
      </svg>
    );

    // Facebook
    add(
      "oauth_facebook",
      "Facebook",
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M22.68 0H1.32A1.32 1.32 0 0 0 0 1.32v21.36C0 23.4.6 24 1.32 24h11.49v-9.29H9.69v-3.62h3.12V8.41c0-3.1 1.89-4.79 4.66-4.79 1.33 0 2.47.1 2.81.14v3.25l-1.93.001c-1.51 0-1.8.72-1.8 1.77v2.32h3.59l-.47 3.62h-3.12V24h6.11c.73 0 1.32-.6 1.32-1.32V1.32A1.32 1.32 0 0 0 22.68 0z" />
      </svg>
    );

    // LinkedIn
    add(
      "oauth_linkedin",
      "LinkedIn",
      <svg className="h-5 w-5" fill="#0A66C2" viewBox="0 0 24 24">
        <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM2 9h6v12H2zm9 0h5.6v1.7h.08c.78-1.4 2.68-2.9 5.52-2.9C23.6 7.8 25 11.2 25 16v5H19v-4.4c0-1.1 0-2.5-1.6-2.5-1.6 0-1.8 1.2-1.8 2.4V21h-6z" />
      </svg>
    );

    // Twitter (X)
    add(
      "oauth_twitter",
      "Twitter (X)",
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.4 1H22l-7 8.1L23 23h-7.3l-5.4-7.9L4.6 23H2l7.9-9.2L1 1h7.3l5 7.4L18.4 1z" />
      </svg>
    );

    // GitLab
    add(
      "oauth_gitlab",
      "GitLab",
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#FC6D26" d="M12 23L1 9h22z" />
      </svg>
    );

    // Bitbucket
    add(
      "oauth_bitbucket",
      "Bitbucket",
      <svg className="h-5 w-5" fill="#2684FF" viewBox="0 0 24 24">
        <path d="M2 4l3 16h14l3-16z" />
      </svg>
    );

    // Discord
    add(
      "oauth_discord",
      "Discord",
      <svg className="h-5 w-5" fill="#5865F2" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z" />
      </svg>
    );

    // Slack
    add(
      "oauth_slack",
      "Slack",
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#e01e5a"
          d="M5.042 15.165a2.528 2.528 0 1 0-2.529 2.528h2.529v-2.528Zm.847 0a2.528 2.528 0 1 0 2.529-2.529v2.53H5.89Z"
        />
        <path
          fill="#36c5f0"
          d="M8.418 5.042a2.528 2.528 0 1 0-2.528-2.529v2.529h2.528Zm0 .847a2.528 2.528 0 1 0 2.529 2.529v-2.53h-2.53Z"
        />
        <path
          fill="#2eb67d"
          d="M18.958 8.418a2.528 2.528 0 1 0 2.529-2.528h-2.529v2.528Zm-.847 0a2.528 2.528 0 1 0-2.529 2.529v-2.53h2.53Z"
        />
        <path
          fill="#ecb22e"
          d="M15.582 18.958a2.528 2.528 0 1 0 2.528 2.529v-2.529h-2.528Zm0-.847a2.528 2.528 0 1 0-2.529-2.529v2.53h2.53Z"
        />
      </svg>
    );

    // Dropbox
    add(
      "oauth_dropbox",
      "Dropbox",
      <svg className="h-5 w-5" fill="#0061FF" viewBox="0 0 24 24">
        <path d="M6 2L1 5l5 3 5-3zm12 0l-5 3 5 3 5-3zm-12 7l-5 3 5 3 5-3zm12 0l-5 3 5 3 5-3zM6 16l5 3 5-3-5-3z" />
      </svg>
    );

    // Notion
    add(
      "oauth_notion",
      "Notion",
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.192 3.127c-.66.45-1.13 1.157-1.13 2.052v12.385c0 1.83 1.34 3.31 2.99 3.31h11.9c1.65 0 2.99-1.48 2.99-3.31V4.99c0-1.76-1.39-3.192-3.123-3.192a3.02 3.02 0 0 0-1.68.513L4.192 3.127zm10.51-1.332c.983 0 1.78.796 1.78 1.778v13.626c0 .98-.797 1.777-1.78 1.777H6.26c-.982 0-1.78-.797-1.78-1.777V6.042c0-.39.26-.73.633-.873l9.59-3.374z" />
      </svg>
    );

    // Atlassian
    add(
      "oauth_atlassian",
      "Atlassian",
      <svg className="h-5 w-5" fill="#0052CC" viewBox="0 0 24 24">
        <path d="M2 2l10 20L22 2z" />
      </svg>
    );

    // Spotify
    add(
      "oauth_spotify",
      "Spotify",
      <svg className="h-5 w-5" fill="#1DB954" viewBox="0 0 24 24">
        <path d="M12 0a12 12 0 1 0 0 24 12 12 0 1 0 0-24zm5.2 17.5a1 1 0 0 1-1.4.3c-3.8-2.3-8.6-1.4-8.6-1.4a1 1 0 0 1-.4-2c5.3-.9 10.1.5 11.7 1.7a1 1 0 0 1 .3 1.4z" />
      </svg>
    );

    // Twitch
    add(
      "oauth_twitch",
      "Twitch",
      <svg className="h-5 w-5" fill="#9146FF" viewBox="0 0 24 24">
        <path d="M4 0L0 4v16h6v4l4-4h6l8-8V0H4zm16 10l-3 3h-5l-3 3V13H6V2h14v8z" />
      </svg>
    );

    // ===========================
    // SAML PROVIDERS (generic logos)
    // ===========================

    const samlIcon = (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#4F46E5">
        <circle cx="12" cy="12" r="10" />
      </svg>
    );

    add("saml", "SAML", samlIcon);
    add("saml_okta", "Okta SAML", samlIcon);
    add("saml_onelogin", "OneLogin SAML", samlIcon);
    add("saml_auth0", "Auth0 SAML", samlIcon);
    add("saml_pingidentity", "PingIdentity SAML", samlIcon);
    add("saml_azure", "Azure AD SAML", samlIcon);
    add("saml_google", "Google Workspace SAML", samlIcon);
    add("saml_jumpcloud", "JumpCloud SAML", samlIcon);

    return providers;
  }, [availableStrategies]);
};
export default useSSOProviders;
