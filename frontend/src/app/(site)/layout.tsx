import { GlobalProviders } from "@/lib/context/global-providers";
import { Sidebar, type SidebarSection } from "@/components/ui";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sidebarSections: SidebarSection[] = [
    {
      title: "Main",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          href: "/dashboard",
        },
        {
          id: "settings",
          title: "Settings",

          href: "/settings",
        },
      ],
    }
  ];
  return (

    <GlobalProviders>
      <Sidebar sections={sidebarSections} />
      <main className="pt-10 px-4 md:px-5 flex-1">
        {children}
      </main>
    </GlobalProviders>

  );
}
