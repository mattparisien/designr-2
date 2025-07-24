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
      <Sidebar navigation={SITE_NAVIGATION} />
      <main className="pt-10 px-4 md:px-5 flex-1">
        {children}
      </main>
    </GlobalProviders>

  );
}
