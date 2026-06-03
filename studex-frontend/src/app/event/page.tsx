"use client";

import { useState } from "react";

const EVENT_DATE = "July 8 - 9, 2025";

export default function EventPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Registration failed");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-black to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Launch Event
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-7xl">
            Global Markets
          </h1>
          <p className="mt-2 text-2xl font-light text-gray-300 sm:text-3xl">
            {EVENT_DATE}
          </p>
          <p className="mt-1 text-lg text-gray-400">
            Location to be confirmed
          </p>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-gray-300">
            The future of business is autonomous. Get your own AI agents, in
            your own environment, fully managed by our agent team.
          </p>
          <a
            href="#register"
            className="mt-10 inline-block rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold transition hover:bg-blue-500"
          >
            Register Now
          </a>
        </div>
      </section>

      {/* What is Global Markets */}
      <section className="border-t border-gray-800 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            What is Global Markets?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-300">
            Global Markets is a new venture connecting businesses with
            cutting-edge AI infrastructure. We provide the agents, the
            environment, and the expertise so you can focus on growing your
            business while AI handles the heavy lifting.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="text-3xl">🌍</div>
              <h3 className="mt-4 text-xl font-semibold">Global Reach</h3>
              <p className="mt-2 text-gray-400">
                Access markets and tools that were previously only available to
                enterprise-level organisations.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="text-3xl">🤖</div>
              <h3 className="mt-4 text-xl font-semibold">AI-First</h3>
              <p className="mt-2 text-gray-400">
                Every client gets purpose-built AI agents tailored to their
                business needs and industry.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="text-3xl">📈</div>
              <h3 className="mt-4 text-xl font-semibold">Scalable</h3>
              <p className="mt-2 text-gray-400">
                Start small, scale big. Your agent infrastructure grows with
                your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agents as a Service */}
      <section className="border-t border-gray-800 bg-gradient-to-b from-gray-950 to-black px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Featured Offering
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Agents as a Service
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-300">
            Your business gets its own dedicated VM container with AI agents
            built for your specific workflows. But we don't just hand you the
            tools and walk away.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-8">
              <h3 className="text-xl font-semibold text-emerald-400">
                Your Own Agent Environment
              </h3>
              <ul className="mt-4 space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="text-emerald-400">&#10003;</span>
                  Dedicated VM container - your data, your agents
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400">&#10003;</span>
                  Custom AI agents built for your business processes
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400">&#10003;</span>
                  Integrations with your existing tools and platforms
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400">&#10003;</span>
                  Full control and visibility over your agent operations
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-900/50 bg-blue-950/30 p-8">
              <h3 className="text-xl font-semibold text-blue-400">
                Our Agents Manage Yours
              </h3>
              <ul className="mt-4 space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="text-blue-400">&#10003;</span>
                  Our management agents monitor and optimise your agents
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400">&#10003;</span>
                  Continuous improvement without you lifting a finger
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400">&#10003;</span>
                  Agent-on-agent: meta-intelligence for your business
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400">&#10003;</span>
                  From setup to ongoing management - fully handled
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section
        id="register"
        className="border-t border-gray-800 px-6 py-20"
      >
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Register for the Event
          </h2>
          <p className="mt-4 text-center text-gray-400">
            Secure your spot at the Global Markets launch. Limited spaces
            available.
          </p>

          {status === "success" ? (
            <div className="mt-10 rounded-2xl border border-emerald-800 bg-emerald-950/50 p-8 text-center">
              <div className="text-4xl">✓</div>
              <h3 className="mt-4 text-xl font-semibold text-emerald-400">
                You&apos;re Registered!
              </h3>
              <p className="mt-2 text-gray-300">
                We&apos;ll send you the event details and location once
                confirmed. See you on {EVENT_DATE}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-300"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+27 ..."
                />
              </div>
              <div>
                <label
                  htmlFor="business"
                  className="block text-sm font-medium text-gray-300"
                >
                  Business Name
                </label>
                <input
                  id="business"
                  type="text"
                  value={form.business}
                  onChange={(e) =>
                    setForm({ ...form, business: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your business (optional)"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-400">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-lg font-semibold transition hover:bg-blue-500 disabled:opacity-50"
              >
                {status === "submitting"
                  ? "Registering..."
                  : "Register Now"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-800 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-6">
            {[
              {
                q: "What is Agents as a Service?",
                a: "You get your own dedicated VM environment with AI agents purpose-built for your business. Our management agents continuously optimise and improve your agents, so you get better results over time without the technical overhead.",
              },
              {
                q: "Do I need technical knowledge?",
                a: "Not at all. We handle everything from setup to ongoing management. You focus on your business, your agents handle the rest.",
              },
              {
                q: "Where is the event?",
                a: "The venue will be confirmed shortly. Registered attendees will be the first to know. The event takes place on July 8-9, 2025.",
              },
              {
                q: "Is there a cost to attend?",
                a: "Registration details and pricing will be shared with registered attendees. Early registration is recommended as spaces are limited.",
              },
              {
                q: "What industries can use Agents as a Service?",
                a: "Any business that wants to automate workflows, manage operations, or scale efficiently. We've worked with retail, services, logistics, and more.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6"
              >
                <summary className="cursor-pointer text-lg font-semibold">
                  {item.q}
                </summary>
                <p className="mt-3 text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-10 text-center text-gray-500">
        <p className="text-lg font-semibold text-white">Global Markets</p>
        <p className="mt-1">
          {EVENT_DATE} &middot; Location TBC
        </p>
        <p className="mt-4 text-sm">
          &copy; {new Date().getFullYear()} Global Markets. All rights
          reserved.
        </p>
      </footer>
    </>
  );
}
