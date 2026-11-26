import { Suspense } from "react";
import { ContextoPortalProvider } from "@/components/layout/contexto-portal";
import { PortalShell } from "@/components/layout/portal-shell";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ContextoPortalProvider>
      <Suspense fallback={null}>
        <PortalShell>{children}</PortalShell>
      </Suspense>
    </ContextoPortalProvider>
  );
}
