import { Sidebar } from "@/app/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#F7F3EF" }}>
      <Sidebar />
      <main className="ml-64 flex-1 px-10 py-10">{children}</main>
    </div>
  );
}
