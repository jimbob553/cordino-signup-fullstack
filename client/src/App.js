import { useState } from "react";
import Signup from "./Signup";
import AdminUsers from "./AdminUsers";


// Main application component that conditionally renders child views
export default function App() {
  // React state hook:
  // `view` holds the current screen
  // `setView` updates it and triggers a re-render
  const [view, setView] = useState("signup"); // initial view is "signup"

  return (
    <div>
      <div
        style={{
          padding: 12,
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #ddd",
        }}
      >
        {/* These buttons update state using the setView hook */}
        <button onClick={() => setView("signup")}>Signup</button>
        <button onClick={() => setView("admin")}>Admin</button>
      </div>

      {/* 
        Conditional rendering:
        If view === "signup", render <Signup />
        Otherwise, render <AdminUsers />
      */}
      {view === "signup" ? <Signup /> : <AdminUsers />}
    </div>
  );
}
