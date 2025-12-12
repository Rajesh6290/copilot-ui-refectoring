"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState, useEffect } from "react";

export default function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
      {!mounted ? (
        <>{children}</>
      ) : (
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          enableColorScheme={true}
        >
          {children}
        </NextThemesProvider>
      )}
    </>
  );
}
