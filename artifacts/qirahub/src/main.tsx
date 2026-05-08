import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { isAdminAuthed } from "@/lib/admin-auth";

setAuthTokenGetter(() =>
  isAdminAuthed() ? sessionStorage.getItem("qirahub_user_token") : null
);

createRoot(document.getElementById("root")!).render(<App />);
