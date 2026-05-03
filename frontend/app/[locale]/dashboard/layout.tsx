import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-black relative">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10">{children}</main>
    </div>
  );
}
