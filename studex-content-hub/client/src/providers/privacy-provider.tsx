import { createContext, type PropsWithChildren, useContext, useState } from "react";

type PrivacyContextValue = {
  isMasked: boolean;
  toggleMasked: () => void;
};

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export function PrivacyProvider({ children }: PropsWithChildren) {
  const [isMasked, setIsMasked] = useState(false);

  return (
    <PrivacyContext.Provider
      value={{
        isMasked,
        toggleMasked: () => setIsMasked((current) => !current),
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error("usePrivacy must be used within PrivacyProvider");
  }
  return context;
}
