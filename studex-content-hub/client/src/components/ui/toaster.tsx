import * as Toast from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast } from "@/providers/toast-provider";

export function Toaster() {
  const { open, setOpen, currentToast } = useToast();

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        className={cn("toast-root", currentToast?.tone === "muted" && "toast-muted")}
        duration={3800}
        open={open}
        onOpenChange={setOpen}
      >
        <div className="toast-copy">
          <Toast.Title className="toast-title">{currentToast?.title}</Toast.Title>
          {currentToast?.description ? (
            <Toast.Description className="toast-description">
              {currentToast.description}
            </Toast.Description>
          ) : null}
        </div>
        <Toast.Close className="toast-close" aria-label="Close notification">
          <X size={16} />
        </Toast.Close>
      </Toast.Root>
      <Toast.Viewport className="toast-viewport" />
    </Toast.Provider>
  );
}
