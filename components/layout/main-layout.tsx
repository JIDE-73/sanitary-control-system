"use client";

import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className={cn(
          "fixed top-4 z-70 mt-10 md:top-5",
          isSidebarOpen ? "left-62 md:left-62" : "left-4 md:left-4"
        )}
      >
        <Button
          variant="secondary"
          size="icon"
          className="rounded-xl shadow-lg border border-border bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          aria-label={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      <SidebarNav isOpen={isSidebarOpen} />
      <div
        className={cn(
          "transition-all duration-200",
          isSidebarOpen ? "md:ml-64" : "md:ml-0"
        )}
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
