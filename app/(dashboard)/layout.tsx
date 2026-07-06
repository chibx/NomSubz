import { Sidebar } from "@/app/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* pt-14 on mobile for the top bar, md:pt-0 + md:ml-64 for desktop sidebar */}
      <main className="flex-1 pt-14 px-4 pb-8 md:pt-8 md:pb-10 md:px-10 md:ml-64">
        <div className="page-enter mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
