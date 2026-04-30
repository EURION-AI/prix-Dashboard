import type { Metadata } from "next";
import { AuthenticationGate } from "@/components/authentication-gate";
import DashboardNav from "@/components/dashboard-nav";

export const metadata: Metadata = {
  title: "Dashboard | Analytics",
  description: "Real-time analytics and performance metrics dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requiredPassword = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || "admin";

  return (
    <AuthenticationGate requiredPassword={requiredPassword}>
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <DashboardNav />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthenticationGate>
  );
}
