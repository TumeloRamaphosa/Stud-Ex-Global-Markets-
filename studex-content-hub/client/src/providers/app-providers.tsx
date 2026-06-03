import type { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/toaster";
import { PrivacyProvider } from "@/providers/privacy-provider";
import { ToastProvider } from "@/providers/toast-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      <PrivacyProvider>
        {children}
        <Toaster />
      </PrivacyProvider>
    </ToastProvider>
  );
}
