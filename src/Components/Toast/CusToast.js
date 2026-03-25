// toastUtils.js
import { toast } from "react-hot-toast";



 export const cusToast = (message, type = "success") => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else if (type === "loading") {
    toast.loading(message);
  } else {
    toast(message); // default
  }
};

