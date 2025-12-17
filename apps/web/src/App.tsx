import { useEffect } from "react";
import { getDashboard } from "./api/endpoints";

export default function App() {
  useEffect(() => {
    getDashboard()
      .then((d) => console.log("dashboard", d))
      .catch((e) => console.error("dashboard error", e.message));
  }, []);

  return <div>Open console</div>;
}
