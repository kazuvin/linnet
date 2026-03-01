import { toast } from "sonner";

export type ToastVariant = "success" | "error";

export function addToast(message: string, variant: ToastVariant = "success") {
  if (variant === "error") {
    toast.error(message);
  } else {
    toast.success(message);
  }
}

export function dismissToast(id: string | number) {
  toast.dismiss(id);
}
