"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Globe,
  Funnel,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Activity,
  LogOut,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: <Home className="w-4 h-4" /> },
  {
    label: "Website Analytics",
    href: "/dashboard/websites",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    label: "Conversion Funnel",
    href: "/dashboard/conversion-funnel",
    icon: <Funnel className="w-4 h-4" />,
  },
  {
    label: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    label: "Affiliates",
    href: "/dashboard/affiliates",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Product Usage",
    href: "/dashboard/product-usage",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    label: "Technical",
    href: "/dashboard/technical",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    label: "Security",
    href: "/dashboard/security",
    icon: <Shield className="w-4 h-4" />,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Analytics
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-300"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/10">
            <button
              onClick={() => {
                sessionStorage.removeItem("dashboard-auth");
                window.location.reload();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock Dashboard</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default DashboardNav;
