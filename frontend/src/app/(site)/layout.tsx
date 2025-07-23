import { GlobalProviders } from "@/lib/context/global-providers";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <GlobalProviders>
      <main className="pt-10 px-4 md:px-5">
        {children}
      </main>
    </GlobalProviders>

  );
}
