import { BottomNav } from "@/components/dashboard/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-950 pb-24">
      <main className="mx-auto max-w-lg px-4 pt-6 sm:max-w-2xl sm:px-6">{children}</main>
      <BottomNav />
    </div>
  );
}
