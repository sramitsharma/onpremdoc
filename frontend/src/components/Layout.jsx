import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "../components/ui/separator";
import { headerConfig } from "../mocks/mock";

const Logo = React.memo(() => (
  <Link to="/docs/introduction" className="flex items-center gap-2">
    <img 
      src={headerConfig.logo.src} 
      alt={headerConfig.logo.alt} 
      width={headerConfig.logo.width} 
      height={headerConfig.logo.height} 
      className="rounded-sm" 
    />
    <span className="font-semibold tracking-tight">OnPrem TechPrimer</span>
  </Link>
));

const NavigationLink = React.memo(({ link }) => (
  <a 
    key={link.label} 
    href={link.href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-sm px-3 py-1 rounded relative group"
  >
    {link.label}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-out" />
  </a>
));

const Header = React.memo(() => (
  <header className="fixed top-0 inset-x-0 h-16 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
    <div className="h-full flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Logo />
      </div>
      <nav className="flex items-center gap-2" role="navigation" aria-label="External links">
        {headerConfig.links.map((link) => (
          <NavigationLink key={link.label} link={link} />
        ))}
      </nav>
    </div>
  </header>
));

const SkipToContent = React.memo(() => (
  <a 
    href="#main" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-1 rounded"
  >
    Skip to content
  </a>
));

const Layout = ({ children }) => (
  <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
    <SkipToContent />
    <Header />
    <div className="pt-16" />
    <main id="main" className="w-full" role="main">
      {children}
    </main>
  </div>
);

export default Layout;