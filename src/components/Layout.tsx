import { Activity, Github, Menu, Stethoscope, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About & Ethics" },
];

export function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-white/88 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">Hybrid Medical AI</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-muted hover:text-slate-950",
                    isActive && "bg-secondary text-primary",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <span>
                <Github className="h-4 w-4" />
                Demo
              </span>
            </Button>
            <Link to="/analyze">
              <Button size="sm">
                <Activity className="h-4 w-4" />
                Start
              </Button>
            </Link>
          </div>
          <Button className="md:hidden" variant="ghost" size="icon" onClick={() => setOpen((value) => !value)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {open && (
          <div className="border-t bg-white md:hidden">
            <div className="container grid gap-1 py-3">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="rounded-md px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="container flex flex-col gap-3 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Hybrid Medical AI Lab Decision Support</p>
          <p>For clinical decision support only. Not a final diagnosis.</p>
        </div>
      </footer>
    </div>
  );
}
