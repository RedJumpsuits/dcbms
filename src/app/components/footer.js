import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-background text-white w-full">
      {/* Watermark text - positioned with negative bottom margin to extend beyond footer */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center overflow-hidden pointer-events-none z-0">
        <div className="text-8xl leading-none font-bold text-white/5 whitespace-nowrap select-none translate-y-1/4">
          Made at Hackverse 5.0 @ NITK
        </div>
      </div>

      {/* Main footer content - positioned above the watermark */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link
              href="/"
              className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors flex gap-2"
            >
              <span>Built with</span>
              <span className="inline-block text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 inline-block"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </span>
              <span>by Red JumpSuits</span>
            </Link>
          </div>
          <nav className="mb-6 md:mb-0">
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/about"
                  className="hover:text-red-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-red-400 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-red-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ReserveX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}