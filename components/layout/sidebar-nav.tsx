"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Stethoscope,
  Building2,
  FileText,
  ClipboardList,
  TestTube,
  LayoutDashboard,
  Settings,
  Bell,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Afiliados",
    href: "/afiliados",
    icon: Users,
    submenu: [
      { name: "Buscar Afiliado", href: "/afiliados" },
      { name: "Nuevo Afiliado", href: "/afiliados/nuevo" },
      { name: "Expedientes", href: "/afiliados/expedientes" },
    ],
  },
  {
    name: "Médicos",
    href: "/medicos",
    icon: Stethoscope,
    submenu: [
      { name: "Lista de Médicos", href: "/medicos" },
      { name: "Nuevo Médico", href: "/medicos/nuevo" },
    ],
  },
  {
    name: "Lugares de Trabajo",
    href: "/lugares-trabajo",
    icon: Building2,
  },
  {
    name: "Consultas Clínicas",
    href: "/consultas",
    icon: ClipboardList,
    submenu: [
      { name: "Nueva Consulta", href: "/consultas/nueva" },
      { name: "Historial", href: "/consultas" },
    ],
  },
  {
    name: "Exámenes",
    href: "/examenes",
    icon: TestTube,
    submenu: [
      { name: "Ordenar Examen", href: "/examenes/nuevo" },
      { name: "Resultados", href: "/examenes/resultados" },
      { name: "Historial", href: "/examenes" },
    ],
  },
  {
    name: "Certificados",
    href: "/certificados",
    icon: FileText,
    submenu: [
      { name: "Emitir Certificado", href: "/certificados/nuevo" },
      { name: "Verificar", href: "/certificados/verificar" },
      { name: "Historial", href: "/certificados" },
    ],
  },
];

const bottomNavigation = [
  { name: "Notificaciones", href: "/notificaciones", icon: Bell },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

interface SidebarNavProps {
  isOpen: boolean;
}

export function SidebarNav({ isOpen }: SidebarNavProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-60 h-screen w-64 transform bg-sidebar text-sidebar-foreground shadow-lg transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">SICS</h1>
            <p className="text-xs text-sidebar-foreground/70">
              Control Sanitario
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground z-20"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openMenus.includes(item.name) && "rotate-180"
                      )}
                    />
                  </button>
                  {openMenus.includes(item.name) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition-colors",
                            pathname === subitem.href
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-sidebar-border px-3 py-4">
          {bottomNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
