export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 bg-black py-12 text-white">
      <div className="section-shell">
        <div className="grid items-center gap-8 text-center md:grid-cols-[1fr_auto] md:text-left">
          <div>
            <p className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">TAPHOADEAl</p>
            <p className="mt-4 text-sm text-neutral-300 sm:text-base">
              ©{currentYear} TAPHOADEAl. All Rights Reserved.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 md:justify-end md:gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=61572099449333"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500 text-neutral-200 transition hover:border-white hover:text-white sm:h-11 sm:w-11"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.4-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.5v8h3z" />
              </svg>
            </a>

            <a
              href="https://www.tiktok.com/@hongtrnminh236?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500 text-neutral-200 transition hover:border-white hover:text-white sm:h-11 sm:w-11"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M16.6 3c.2 1.7 1.2 3.1 2.7 3.9.8.4 1.7.7 2.7.7v3.1c-1.6 0-3.2-.5-4.5-1.4v5.7c0 3.4-2.8 6.2-6.2 6.2S5 18.4 5 15s2.8-6.2 6.2-6.2c.3 0 .5 0 .8.1v3.2c-.3-.1-.5-.2-.8-.2-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V3h2.3z" />
              </svg>
            </a>

            <a
              href="https://www.youtube.com/@LuLuMeo-06"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500 text-neutral-200 transition hover:border-white hover:text-white sm:h-11 sm:w-11"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M23 12c0-2.2-.2-3.7-.5-4.5-.3-.9-1-1.6-1.9-1.9C19.8 5.3 18.2 5 12 5S4.2 5.3 3.4 5.6c-.9.3-1.6 1-1.9 1.9C1.2 8.3 1 9.8 1 12s.2 3.7.5 4.5c.3.9 1 1.6 1.9 1.9.8.3 2.4.6 8.6.6s7.8-.3 8.6-.6c.9-.3 1.6-1 1.9-1.9.3-.8.5-2.3.5-4.5zm-13 3.5v-7l6 3.5-6 3.5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
