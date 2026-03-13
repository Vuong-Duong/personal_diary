import { toast } from "sonner";

export const showSuccessToast = (title: string, description?: string) => {
  toast.success(title, {
    description,
    duration: 5000,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast.error(title, {
    description,
    duration: 5000,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast.info(title, {
    description,
    duration: 5000,
  });
};
