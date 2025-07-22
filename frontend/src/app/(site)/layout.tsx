import { GlobalProviders } from "@/lib/context/global-providers";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <GlobalProviders>
      <main className="p-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 sm:py-6 md:py-8 lg:py-10 xl:py-12 2xl:py-16">
        {children}
      </main>
    </GlobalProviders>

  );
}
