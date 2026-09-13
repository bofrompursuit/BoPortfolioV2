import { useEffect, useState } from "react";
import QRCode from "qrcode";

// No form backend yet — submitting composes a mail draft in the visitor's client.
export const CONTACT_EMAIL = "boudich@live.com.ph";

export const VENMO_HANDLE = "Beau_Moldenhauer";
export const VENMO_URL = `https://venmo.com/u/${VENMO_HANDLE}`;

const LINKS = [
  {
    label: "LinkedIn",
    handle: "in/bomoldenhauer",
    url: "https://www.linkedin.com/in/bomoldenhauer",
  },
  {
    label: "GitHub",
    handle: "bofrompursuit",
    url: "https://github.com/bofrompursuit",
  },
  {
    label: "Linktree",
    handle: "bomoldenhauer",
    url: "https://linktr.ee/bomoldenhauer?utm_source=linktree_profile_share&ltsid=044edb07-7d48-4ec0-81ad-90e9200405d5",
  },
];

const fieldBase =
  "w-full rounded-lg border bg-black/60 px-3.5 py-2.5 text-sm text-white transition " +
  "placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/60";

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please add your name.";

  const contact = values.contact.trim();
  if (!contact) {
    errors.contact = "An email or phone number is required.";
  } else if (contact.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) {
    errors.contact = "That email address doesn't look right.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Tell me a little more — at least 10 characters.";
  }
  return errors;
}

export function ContactCard({ idPrefix = "cf" }) {
  const [values, setValues] = useState({ name: "", contact: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sent

  const set = (key) => (event) => {
    setValues((v) => ({ ...v, [key]: event.target.value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (status === "sent") setStatus("idle");
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    const body = [
      `Name: ${values.name}`,
      `Contact: ${values.contact}`,
      "",
      values.message,
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `Portfolio inquiry from ${values.name}`
    )}&body=${encodeURIComponent(body)}`;
    setStatus("sent");
  };

  const fieldClass = (key) =>
    `${fieldBase} ${errors[key] ? "border-rose-400/70" : "border-white/25 hover:border-white/45"}`;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field
        id={`${idPrefix}-name`}
        label="Name"
        error={errors.name}
      >
        <input
          id={`${idPrefix}-name`}
          className={fieldClass("name")}
          placeholder="Your name"
          value={values.name}
          onChange={set("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${idPrefix}-name-err` : undefined}
        />
      </Field>

      <Field
        id={`${idPrefix}-contact`}
        label="Email or contact details"
        error={errors.contact}
      >
        <input
          id={`${idPrefix}-contact`}
          className={fieldClass("contact")}
          placeholder="you@example.com"
          value={values.contact}
          onChange={set("contact")}
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={errors.contact ? `${idPrefix}-contact-err` : undefined}
        />
      </Field>

      <Field
        id={`${idPrefix}-message`}
        label="How can I help?"
        error={errors.message}
      >
        <textarea
          id={`${idPrefix}-message`}
          rows={4}
          className={`${fieldClass("message")} resize-y`}
          placeholder="Tell me about the project, service or question."
          value={values.message}
          onChange={set("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${idPrefix}-message-err` : undefined}
        />
      </Field>

      <button
        type="submit"
        className="w-full rounded-lg border border-white/40 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/20 hover:shadow-[0_0_26px_-4px_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-white/70 active:scale-[0.99]"
      >
        {status === "sent" ? "Draft opened ✓" : "Send inquiry"}
      </button>

      <p role="status" aria-live="polite" className="min-h-[1.25rem] text-xs">
        {status === "sent" && (
          <span className="text-white/70">
            Your mail app should have opened with the message ready to send.
          </span>
        )}
      </p>
    </form>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/70"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContributeCard() {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    QRCode.toDataURL(VENMO_URL, {
      margin: 1,
      width: 400,
      color: { dark: "#ffffff", light: "#00000000" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <p className="text-sm leading-relaxed text-white/70">
        Donate to my SMB &amp; my future apps through Venmo
      </p>

      <div className="rounded-xl border border-white/30 bg-black/70 p-3 shadow-[0_0_32px_-8px_rgba(255,255,255,0.5)]">
        {qr ? (
          <img
            src={qr}
            alt={`Venmo QR code for @${VENMO_HANDLE}`}
            className="h-36 w-36"
          />
        ) : (
          <div className="flex h-36 w-36 items-center justify-center px-2 text-xs text-white/50">
            QR unavailable — use the handle below
          </div>
        )}
      </div>

      <a
        href={VENMO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] items-center rounded-lg border border-white/30 px-5 py-3 font-mono text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/10 hover:shadow-[0_0_22px_-6px_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-white/70"
      >
        @{VENMO_HANDLE}
      </a>
    </div>
  );
}

export function ConnectCard() {
  return (
    <ul className="space-y-3">
      {LINKS.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 rounded-lg border border-white/20 bg-black/50 px-4 py-4 transition hover:border-white/70 hover:bg-white/10 hover:shadow-[0_0_26px_-8px_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">{link.label}</span>
              <span className="block truncate text-xs text-white/55">{link.handle}</span>
            </span>
            <span className="shrink-0 text-white/70 transition group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
