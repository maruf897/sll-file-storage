import { toast } from "react-toastify";

export const toastCall = (type, msg) => {
  toast.configure();
  console.log("toast called");
  if (type === "error") {
    toast.error(msg, {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } else if (type === "success") {
    toast.success(msg, {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};
