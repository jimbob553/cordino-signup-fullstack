import { useMemo, useState } from "react";
import "./signup.css";

const API = "http://localhost:5050/api/users";

function detectCardBrand(digits) {
  //Card detection based on standard BIN ranges
  if (/^4/.test(digits)) return "VISA";
  if (/^(5[1-5])/.test(digits) || /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return "MASTERCARD";
  if (/^3[47]/.test(digits)) return "AMEX";
  if (/^6(?:011|5)/.test(digits)) return "DISCOVER";
  return "";
}


export default function Signup() {
  const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  inviteCode: "",
  cardNumber: "",
  cardExp: "",
  cardCvv: "",
    });

    // submission state + status/error messages
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  

  // Derived helpers (just for UX)
  // useMemo to avoid recalculating on every render unless dependencies change
  //(Only re-calculate this if the inputs changed e.g., form.cardNumber)
  const cardDigits = useMemo(
  () => form.cardNumber.replace(/\D/g, ""), // remove non-digits
  [form.cardNumber]
  );

  const cardLast4 = useMemo(
  () => cardDigits.slice(-4), // last 4 digits
  [cardDigits]
  );

  const cardBrand = useMemo(
  () => detectCardBrand(cardDigits),
  [cardDigits]
  );

  

  function onChange(e) {
    const { name, value } = e.target;

    if (name === "cardNumber") {
  // Remove everything except digits
  const digits = value.replace(/\D/g, "").slice(0, 16);
  // Insert space every 4 digits
  const spaced = digits.replace(/(.{4})/g, "$1 ").trim();
  // Update state stores formatted value in state (what shows in input)
  setForm((p) => ({ ...p, [name]: spaced }));
  return;
}

    if (name === "cardExp") {
      // force MM/YY style as user types: 0128 -> 01/28
      const digits = value.replace(/\D/g, "").slice(0, 4);
      // format accordingly (insert slash after 2 digits)
      const formatted = digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
      // stores formatted value in state
      setForm((p) => ({ ...p, [name]: formatted }));
      return;
    }

    if (name === "cardCvv") { 
        // remove all non-digits and cap at 3 digits   
      const digits = value.replace(/\D/g, "").slice(0, 3);
      setForm((p) => ({ ...p, [name]: digits }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  }

  function buildPayload() {
    // object to send to backend
    //  store only cardLast4 + cardExp (per backend model)
    // CVV is collected for demo UX but NOT sent/stored.
    const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        inviteCode: form.inviteCode,
        };
        // add payment fields if available
    if (cardLast4) payload.cardLast4 = cardLast4;
    if (form.cardExp.trim()) payload.cardExp = form.cardExp.trim();

    return payload;
  }
  // handle form submission and user creation 
  async function onSubmit(e) {
    // prevent default form submission behavior
    e.preventDefault();
    setError("");
    setStatus("");
    setSubmitting(true);

    if (form.password !== form.confirmPassword) {
        setSubmitting(false);
        setError("Passwords do not match");
        return;
        }

    try { // make POST API call to create user
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Signup failed: ${res.status}`);
      }

      setStatus("🎉 Account created! Welcome to Cordino™ 🎉");
      // reset after creation 
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        inviteCode: "",
        cardNumber: "",
        cardExp: "",
        cardCvv: "",
      });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
        // always unset submitting state to re-enable form
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      {/* Subtle animated header background (Stripe-ish vibe) */}
      <div className="hero">
        <div className="heroGlow" />
      </div>

      <div className="wrap">
        <div className="brand">
        <div className="brandLogoWrap">
            <img
            className="brandLogo"
            src="/assets/cordinoLogo.png"
            alt="Cordino"
            />
        </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h1>Create your account</h1>
            <p className="sub">
              Private social media company — no ads, no algorithms, no external connections.
            </p>
          </div>

           
          {status && <div className="alert ok">{status}</div>}
          {error && (
            <div className="alert err">
              <b>Error:</b> {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="form">
            <div className="sectionTitle">Personal Information</div>

            <div className="grid2">
                <div className="field">
                <label>First name</label>
                <input
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    placeholder="Jane"
                    required
                />
                </div>

                <div className="field">
                <label>Last name</label>
                <input
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    placeholder="Doe"
                    required
                />
                </div>
            </div>

            <div className="field">
                <label>Email</label>
                <input
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@yourEmail.com"
                required
                />
            </div>

            <div className="divider" />

            <div className="sectionTitle">Account credentials</div>

            <div className="field">
                <label>Create Username</label>
                <input
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="jane_doe"
                autoComplete="username"
                required
                />
            </div>

            <div className="grid2">
                <div className="field">
                <label>Create Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                />
                </div>

                <div className="field">
                <label>Confirm password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="Re-type password"
                    autoComplete="new-password"
                    required
                />
                </div>
            </div>

            <div className="field invite">
                <label>Invite code</label>
                <input
                name="inviteCode"
                value={form.inviteCode}
                onChange={onChange}
                placeholder="Provided by your company admin"
                />
                <div className="help">
                Some organizations require an invite to join. (Not enforced in this demo.)
                </div>
            </div>


            <div className="divider" />

            <div className="sectionTitle">Payment details (demo)</div>

            <div className="field">
            <label>Credit card number</label>

            <div className="inputWithBadge">
                <input
                name="cardNumber"
                value={form.cardNumber}
                onChange={onChange}
                placeholder="3333 7777 3333 7777"
                inputMode="numeric"
                autoComplete="cc-number"
                />
                {/* Display card brand badge if available */}
                {cardBrand && <span className="badge">{cardBrand}</span>}
            </div>

            <div className="help">
                We store only the last 4 digits. CVV is never stored.
            </div>
            </div>


            <div className="grid2">
              <div className="field">
                <label>Expiration (MM/YY)</label>
                <input
                  name="cardExp"
                  value={form.cardExp}
                  onChange={onChange}
                  placeholder="01/28"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
              </div>

              <div className="field">
                <label>CVV</label>
                <input
                  name="cardCvv"
                  value={form.cardCvv}
                  onChange={onChange}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
            </div>

            <button className="btn primary" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create account"}
            </button>
            <div className="oauthDivider">
            <span>OR</span>
            </div>

            <button
            type="button"
            className="btn secondary"
            disabled
            aria-disabled="true"
            >
            Request an invite (coming soon)
            </button>

            <p className="fineprint">
              By continuing, you agree this is a demo signup flow. In production, payment data would be handled
              by a PCI-compliant provider (e.g., Stripe Elements) and CVV would never touch our database.
            </p>
           
            
            
          </form>
        </div>
      </div>
    </div>
  );
}
