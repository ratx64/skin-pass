import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="shell">
      <a className="skip-link" href="#converter">
        Skip to converter
      </a>

      <header className="shell-header">
        <div className="shell-frame shell-header-row">
          <p className="wordmark">SkinPass</p>
          <p className="meta">In this browser</p>
        </div>
      </header>

      <main id="converter" tabIndex={-1} className="shell-frame shell-main">
        {children}
      </main>

      <footer className="shell-footer">
        <div className="shell-frame">
          <p>
            Copyright {new Date().getFullYear()} SkinPass. Created by{' '}
            <a
              href="https://x.com/ratx64"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              ratx64
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
