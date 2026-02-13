'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/Header";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col w-full">
        <Header />
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}