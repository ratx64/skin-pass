import { useState, type ReactNode } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = ['Inventory', 'Loadout', 'Play', 'Store', 'News'];

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen relative flex flex-col overflow-hidden text-[#e5f1ff]">
      <header className="relative z-40 border-b border-[#7fa4c7]/35 bg-[#111a25]/88 backdrop-blur-md">
        <div className="absolute inset-0 cs2-topo-overlay opacity-55" />
        <nav className="relative flex min-h-[56px] items-center justify-between px-4 py-2 lg:px-8" aria-label="Global">
          <div className="flex items-center">
            <a href="#" className="inline-flex items-center">
              <div>
                <p className="cs2-hud-text text-[1.05rem] leading-none text-[#cbe2f7]">SkinPass</p>
                <p className="text-[10px] uppercase leading-none tracking-[0.18em] text-[#84b6e7]/90 mt-0.5">Inspect Utility</p>
              </div>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-5 h-full">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                className={`cs2-hud-text text-[1.05rem] leading-none transition-colors ${
                  item === 'Play' ? 'text-[#f4d04f]' : 'text-[#a8c4df] hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:inline-flex items-center gap-2.5 h-full">
            <span className="cs2-hud-text text-[0.95rem] leading-none text-[#8fe64d]">Online</span>
            <div className="h-2.5 w-2.5 rounded-full bg-[#8fe64d] shadow-[0_0_10px_rgba(143,230,77,0.75)]" />
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-sm border border-[#7293b0]/50 bg-[#1a2736] p-2 text-[#d5e8fb]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>

        <Dialog as="div" className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#121e2a] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-[#7ca2c7]/60">
            <div className="flex items-center justify-between">
              <span className="cs2-hud-text text-xl text-[#cbe2f7]">Menu</span>
              <button
                type="button"
                className="rounded-sm border border-[#7293b0]/50 bg-[#1a2736] p-2 text-[#d5e8fb]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  className={`w-full rounded-sm border px-3 py-2 text-left cs2-hud-text text-lg ${
                    item === 'Play'
                      ? 'border-[#f4d04f]/70 bg-[#3a3320] text-[#ffe98e]'
                      : 'border-[#7293b0]/45 bg-[#1b2b3b] text-[#cde4fa]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      <main className="relative flex-1 overflow-y-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[8%] top-[12%] h-44 w-44 rounded-full border border-[#8ec6fa]/18" />
          <div className="absolute right-[10%] top-[22%] h-56 w-56 rounded-full border border-[#f4d04f]/10" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d141d]/75 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative min-h-full flex flex-col items-center justify-center px-4 py-3 lg:px-8"
        >
          <div className="w-full max-w-[540px] space-y-3">{children}</div>
        </motion.div>
      </main>

      <footer className="relative z-20 border-t border-[#6f8cac]/35 bg-[#111a25]/92 px-4 py-2.5 text-center text-[11px] text-[#9eb9d4]">
        <span>Copyright {new Date().getFullYear()} SkinPass - Created by </span>
        <a
          href="https://x.com/ratx64"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f4d04f] hover:text-[#ffe68c] transition-colors"
        >
          ratx64
        </a>
      </footer>
    </div>
  );
}
