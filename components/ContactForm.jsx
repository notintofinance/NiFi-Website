"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { siteConfig } from "@/data/site-config";

const inputClass =
  "w-full rounded-lg border border-navy-600 bg-navy-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function ContactForm() {
  const accessKey = siteConfig.contactFormKey;
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");

    const form = e.target;
    const data = new FormData(form);
    const payload = {
      access_key: accessKey,
      subject: `New contact from ${data.get("name")} — ${data.get("subject")}`,
      from_name: "NiFi Website",
      name: data.get("name"),
      email: data.get("email"),
      institution: data.get("institution"),
      about: data.get("subject"),
      message: data.get("message"),
      botcheck: data.get("botcheck"),
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-accent/30 bg-navy-700/40 p-10 text-center">
        <CheckCircle2 size={48} className="text-accent-mint" />
        <h3 className="text-xl font-bold text-white">Thanks for reaching out!</h3>
        <p className="max-w-md text-slate-400">
          We&apos;ve got your message and will get back to you by email soon.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-semibold text-accent-bright hover:text-white"
        >
          Send another message
        </button>
      </div>
    );
  }

  const disabled = !accessKey || status === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-navy-600/60 bg-navy-700/40 p-6 sm:p-8"
    >
      {/* Honeypot for spam bots */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Name <span className="text-accent-bright">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Your name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Email <span className="text-accent-bright">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Institution
          </label>
          <input
            name="institution"
            type="text"
            placeholder="Company, school, or organization"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            About <span className="text-accent-bright">*</span>
          </label>
          <input
            name="subject"
            type="text"
            required
            placeholder="What's this about?"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          Description <span className="text-accent-bright">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us a bit more…"
          className={`${inputClass} resize-y`}
        />
      </div>

      {status === "error" && (
        <p className="mt-4 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={16} />
          Something went wrong. Please try again, or email us directly.
        </p>
      )}

      {!accessKey && (
        <p className="mt-4 flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle size={16} />
          The form isn&apos;t connected yet (missing access key).
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send message"}
        {status !== "sending" && <Send size={16} />}
      </button>
    </form>
  );
}
