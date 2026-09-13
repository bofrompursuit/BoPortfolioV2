import { useEffect, useState } from "react";
import QRCode from "qrcode";

// TODO(bo): replace with the address you want inquiries delivered to. Until a
// real form endpoint exists, submitting opens the visitor's mail client.
export const CONTACT_EMAIL = "hello@example.com";

// TODO(bo): verify this resolves to your profile before sharing widely.
export const VENMO_HANDLE = "beau_moldenhauer";
export const VENMO_URL = `https://venmo.com/u/${VENMO_HANDLE}`;

const LINKS = [
  { label: "linkedin.com/in/bomoldenhauer", url: "https://www.linkedin.com/in/bomoldenhauer" },
  { label: "github.com/bofrompursuit", url: "https://github.com/bofrompursuit" },
  {
    label: "linktr.ee/bomoldenhauer",
    url: "https://linktr.ee/bomoldenhauer?utm_source=linktree_profile_share&ltsid=044edb07-7d48-4ec0-81ad-90e9200405d5",
  },
];

const field =
  "w-full rounded-lg border border-cyan-300/20 bg-black/40 px-3 py-2 text-sm text-white " +
  "placeholder:text-white/30 outline-none transition focus:border-cyan-300/60 focus:bg-black/60";

export function ContactCard({ idPrefix = "cf" }) {
  const [sent, setSent] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = [
      `Name: ${data.get("name") || ""}`,
      `Contact: ${data.get("contact") || ""}`,
      "",
      data.get("message") || "",
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `Portfolio inquiry from ${data.get("name") || "the site"}`
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor={`${idPrefix}-name`} className="mb-1 block text-[0.7rem] uppercase tracking-[0.18em] text-cyan-200/70">
          Name
        </label>
        <input id={`${idPrefix}-name`} name="name" required className={field} placeholder="Your name" />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-contact`} className="mb-1 block text-[0.7rem] uppercase tracking-[0.18em] text-cyan-200/70">
          Contact details
        </label>
        <input id={`${idPrefix}-contact`} name="contact" required className={field} placeholder="Email or phone" />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-message`} className="mb-1 block text-[0.7rem] uppercase tracking-[0.18em] text-cyan-200/70">
          Inquiry
        </label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          rows={4}
          required
          className={field}
          placeholder="What would you like to build or ask about?"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg border border-cyan-300/40 bg-cyan-300/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/25"
      >
        Send inquiry
      </button>

      {sent && (
        <p className="text-xs text-cyan-200/70">
          Your mail client should have opened with the message ready to send.
        </p>
      )}
    </form>
  );
}

export function ContributeCard() {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    QRCode.toDataURL(VENMO_URL, {
      margin: 1,
      width: 320,
      color: { dark: "#8ceaff", light: "#00000000" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-xl border border-cyan-300/25 bg-black/50 p-3">
        {qr ? (
          <img src={qr} alt={`Venmo QR code for @${VENMO_HANDLE}`} className="h-32 w-32" />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center text-xs text-white/40">
            QR unavailable
          </div>
        )}
      </div>

      <p className="text-sm leading-relaxed text-white/70">
        Donate to my SMB &amp; my future apps through Venmo:{" "}
        <a
          href={VENMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-cyan-200 underline decoration-cyan-300/40 underline-offset-4"
        >
          @{VENMO_HANDLE}
        </a>
      </p>
    </div>
  );
}

export function ConnectCard() {
  return (
    <ul className="space-y-2">
      {LINKS.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 rounded-lg border border-cyan-300/15 bg-black/30 px-4 py-3 text-sm text-white/80 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-white"
          >
            <span className="truncate">{link.label}</span>
            <span className="shrink-0 text-cyan-200/60 transition group-hover:translate-x-0.5">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
