"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Users,
  ClipboardList,
  Search,
  UserPlus,
  LogIn,
  LogOut,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "HR Pipeline",
    items: [
      {
        title: "HR Overview",
        href: "/dashboard/hr",
        icon: GitBranch,
      },
      {
        title: "Manpower",
        href: "/dashboard/manpower",
        icon: ClipboardList,
      },
      {
        title: "Rekrutmen",
        href: "/dashboard/recruitment",
        icon: Search,
      },
      {
        title: "Kandidat",
        href: "/dashboard/candidates",
        icon: UserPlus,
      },
      {
        title: "Onboarding",
        href: "/dashboard/onboarding",
        icon: LogIn,
      },
      {
        title: "Employee",
        href: "/dashboard/employees",
        icon: Users,
      },
      {
        title: "Offboarding",
        href: "/dashboard/offboarding",
        icon: LogOut,
      },
    ],
  },
  {
    items: [
      {
        title: "Pengaturan",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
          <Zap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold tracking-wide text-white">
              DUPOIN
            </span>
            <span className="truncate text-[10px] font-medium uppercase tracking-widest text-cyan-400/70">
              Sheet Manager
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className={sIdx > 0 ? "mt-4" : ""}>
            {section.label && !collapsed && (
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {section.label}
              </div>
            )}
            {section.label && collapsed && (
              <div className="mb-2 border-t border-white/5" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                const navLink = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 shadow-sm shadow-cyan-500/5"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4.5 w-4.5 shrink-0 transition-colors",
                        isActive
                          ? "text-cyan-400"
                          : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-zinc-900 text-white border-zinc-800"
                      >
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return navLink;
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-zinc-500 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Kecilkan</span>
            </>
          )}
        </Button>
      </div>

      <div className="absolute -right-px top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/20 via-transparent to-blue-500/20" />
    </aside>
  );
}
