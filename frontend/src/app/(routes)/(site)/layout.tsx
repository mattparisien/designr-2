import { Sidebar } from "@/components/ui";
import { SITE_NAVIGATION } from "@/lib/constants";
import { GlobalProviders } from "@/lib/context/global-providers";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <GlobalProviders>
      <Sidebar navigation={SITE_NAVIGATION} className="fixed left-0 top-0" />
      <main className="pr-[1rem] pl-[calc(var(--sidebar-width)+1rem)] flex-1">
        {children}
      </main>
    </GlobalProviders>

  );
}
