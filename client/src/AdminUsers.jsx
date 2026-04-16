// React hooks:
// useState  → component-owned data
// useEffect → run side effects (like API calls)
import { useEffect, useState } from "react";
import "./admin.css";

// Base URL for backend API
const API = "http://localhost:5050/api/users";

export default function AdminUsers() {

  // ======================================================
  // STATE
  // ======================================================

  // List of users from the backend
  // [current state value, function to update it]
  const [users, setUsers] = useState([]);

  // Status message for success feedback
  const [status, setStatus] = useState("");

  // Error message for failed API calls / validation
  const [error, setError] = useState("");

  // Form state
  // If `id` exists -> edit
  // If `id` is empty -> create
  const [form, setForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    cardLast4: "",
    cardExp: "",
  });

  // ======================================================
  // DATA FETCHING (READ)
  // ======================================================

  
  async function loadUsers() {
    // clear the UI error before loading
    setError("");
    //// 1️⃣ Wait for server response (headers + status)
    const res = await fetch(API);
    // 2️⃣ If server said "nope", stop here and show error
    if (!res.ok) {
      throw new Error(`GET users failed: ${res.status}`);
    }
      // 3️⃣ Now read the body stream as JSON
    const data = await res.json();
    // 4️⃣ Store (data) in React state ([users, setUsers])
    setUsers(data); 
  }

  // Run once when component mounts (loadUsers called) and store errors in state
  useEffect(() => {
    loadUsers().catch((e) => setError(e.message));
  }  // empty dependency array = run once on mount
  , []);

  // ======================================================
  // FORM HANDLING
  // ======================================================

  // Update form state as user types ( React re-renders on every keystroke using a controlled input) -> 
  /* <input
  name="email"
  value={form.email}
  onChange={handleChange}
  />   */
  function handleChange(e) {
    // copy previous form state + update changed field 
    setForm((prev) => ({
      // spread previous form state
      ...prev,
      // update changed field
      [e.target.name]: e.target.value,
    }));
  }

  // Reset form back to empty
  function resetForm() {
    // reset form state to initial empty values
    setForm({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      cardLast4: "",
      cardExp: "",
    });
  }

  // A payload is the actual data you send inside a request to the server
  // Required fields always sent
  // Optional fields only sent if filled in
  function buildPayload() {
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      username: form.username.trim()
    };

    if (form.cardLast4.trim() !== "") {
      payload.cardLast4 = form.cardLast4.trim();
    }

    if (form.cardExp.trim() !== "") {
      payload.cardExp = form.cardExp.trim();
    }

    // Only send password when creating a user
    if (!form.id) {
      payload.password = form.password;
      payload.confirmPassword = form.confirmPassword;
  }

    return payload;
  }

  // ======================================================
  // CREATE + UPDATE
  // ======================================================

  async function handleSubmit(e) {
    // prevent page reload
    e.preventDefault();

    if (!form.id && form.password !== form.confirmPassword) {
    setError("Passwords do not match");
    return;
    }
    // clear previous errors
    setError("");
    // clear status message
    setStatus("");

    try {
      // determine if creating or updating
      const isEdit = Boolean(form.id);
      // set method and URL accordingly
      const method = isEdit ? "PUT" : "POST";
      // set URL accordingly
      const url = isEdit ? `${API}/${form.id}` : API;
      // make the API call
      const res = await fetch(url, {
        // set HTTP
        method,
        // set JSON headers
        headers: { "Content-Type": "application/json" },
        // set request body
        body: JSON.stringify(buildPayload()),
      });
      // parse response body as JSON
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {    // data?.message from server || generic message
        throw new Error(data?.message || `${method} failed`);
      }

      setStatus(isEdit ? "User updated successfully." : "User created successfully.");
      resetForm();
      await loadUsers();

    } catch (e) {
      setError(e.message || "Save failed");
    }
  }

  async function resetPassword(user) {
  const id = user._id || user.id;
  if (!id) return;

  const password = window.prompt(`Enter a new password for ${user.email}:`);
  if (!password) return;

  const confirmPassword = window.prompt("Confirm the new password:");
  if (confirmPassword === null) return;

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setError("");
  setStatus("");

  try {  // make API call to reset password  this api maps directly to a route in userRoutes.js
    const res = await fetch(`${API}/${id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      // request body with new password and confirmPassword into a JSON string
      body: JSON.stringify({ password, confirmPassword }),
    });

    // parse response body as JSON .catch to avoid crash if no JSON
    const data = await res.json().catch(() => ({}));
    // check for errors from server 
    if (!res.ok) throw new Error(data?.message || "Password reset failed");

    setStatus("Password reset successfully.");
  } catch (e) {
    setError(e.message || "Password reset failed");
  }
}


  // ======================================================
  // DELETE
  // ======================================================

  async function deleteUser(user) {
    const id = user._id || user.id;
    if (!id) return;
    // confirm before deleting
    if (!window.confirm(`Delete ${user.email}?`)) return;

    setError("");
    setStatus("");

    try {  // make API call to delete user 
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      // parse response body as JSON .catch to avoid crash if no JSON and just return empty object
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Delete failed");
      }

      setStatus("User deleted successfully.");
      await loadUsers();

    } catch (e) {
      setError(e.message || "Delete failed");
    }
  }

  // ======================================================
  // EDIT MODE
  // ======================================================

  // Populate form with selected user data
  function editUser(user) {
    setError("");
    setStatus("");

    setForm({
      id: user._id || user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
      password: "",
      confirmPassword: "",
      cardLast4: user.cardLast4 || "",
      cardExp: user.cardExp || "",
    });
    // scroll to top to see form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ======================================================
  // UI (JSX)
  // ======================================================

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>Admin – Users CRUD</h2>
      {/* Status message */}
      {status && <p style={{ color: "green" }}>{status}</p>}

      {error && (
        <p style={{ color: "crimson" }}>
          <b>Error:</b> {error}
        </p>
      )}

      {/* Create / Edit Form */}
      {/* {handleSubmit creates/updates user} */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <h3>{form.id ? "Edit User" : "Create User"}</h3>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>                   {/* {handleChange updates form state} */}
          <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} />
          <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
          <input type="password" name="password" placeholder="Temp password" value={form.password} onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} />
          <input name="cardLast4" placeholder="Card last 4" value={form.cardLast4} onChange={handleChange} />
          <input name="cardExp" placeholder="Exp MM/YY" value={form.cardExp} onChange={handleChange} />
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button type="submit" className="btn create">{form.id ? "Update" : "Create"}</button>
          <button type="button" className="btn clear" onClick={resetForm}>Clear</button>
          <button type="button" className="btn refresh" onClick={() => loadUsers().catch((e) => setError(e.message))}>
            Refresh
          </button>
        </div>
      </form>

      <hr />

      {/* Users Table */}
      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Username</th>
            <th>Created</th>
            <th>Actions</th>
            
          </tr>
        </thead>
        <tbody>
          {/* Render users -> comes from state -> [users, setUsers] -> loadUsers */}
          {users.map((u) => (
            <tr key={u._id || u.id}>
              <td>{u.email}</td>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.username || ""}</td>
              <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}</td>
            {/* Actions */}
              <td> {/* dynamic Action buttons (passes user object to each handler) */}
                <button className="btn edit" onClick={() => editUser(u)}>Edit</button>{" "}
                <button className="btn delete" onClick={() => deleteUser(u)}>Delete</button>
                <button className="btn" onClick={() => resetPassword(u)}>Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
