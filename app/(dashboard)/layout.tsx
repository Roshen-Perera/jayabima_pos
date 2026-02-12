import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify token on server side (Node.js runtime)
  const user = await getCurrentUser();
  
  // If token is invalid or expired, redirect to login
  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col w-full">
        <Header />
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
