import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { headerConfig } from "../mocks/mock";

export default function Layout({ onToggleAssistant, children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-1 rounded">
        Skip to content
      </a>
      <header className="fixed top-0 inset-x-0 h-14 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/docs/introduction" className="flex items-center gap-2">
              <img src={headerConfig.logo.src} alt={headerConfig.logo.alt} width={headerConfig.logo.width} height={headerConfig.logo.height} className="rounded-sm" />
              <span className="font-semibold tracking-tight">Docs Portal</span>
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            {headerConfig.links.map((l) => (
              l.label === "Help" ? (
                <Button key={l.label} variant="secondary" size="sm" onClick={onToggleAssistant} className="hover:translate-y-[-1px] transition-transform">
                  {l.label}
                </Button>
              ) : (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded hover:bg-accent transition-colors">
                  {l.label}
                </a>
              )
            ))}
          </nav>
        </div>
      </header>
      <div className="pt-14" />
      <Separator />
      <main id="main" className="max-w-[1400px] mx-auto px-4">
        {children}
      </main>
    </div>
  );
}