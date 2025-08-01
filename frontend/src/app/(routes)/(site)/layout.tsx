import NavigationSidebar from "@/components/NavigationSidebar";
import { GlobalProviders } from "@/lib/context/global-providers";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <GlobalProviders>
      <NavigationSidebar />
      <main className="pr-[1rem] pl-[calc(var(--sidebar-width)+1rem)] flex-1">
        {children}
      </main>
    </GlobalProviders>

  );
}
