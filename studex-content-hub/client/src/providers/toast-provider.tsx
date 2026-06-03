import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type ToastTone = "default" | "muted";

type ToastPayload = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  currentToast: ToastPayload | null;
  open: boolean;
  setOpen: (value: boolean) => void;
  pushToast: (toast: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [currentToast, setCurrentToast] = useState<ToastPayload | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      setOpen(false);
    }, 3900);

    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <ToastContext.Provider
      value={{
        currentToast,
        open,
        setOpen,
        pushToast: (toast) => {
          setCurrentToast({ tone: "default", ...toast });
          setOpen(false);
          window.setTimeout(() => setOpen(true), 10);
        },
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
