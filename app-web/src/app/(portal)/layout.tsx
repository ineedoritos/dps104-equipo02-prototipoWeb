import { Suspense } from "react";
import { ContextoPortalProvider } from "@/components/layout/contexto-portal";
import { PortalShell } from "@/components/layout/portal-shell";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <ContextoPortalProvider>
        <PortalShell>{children}</PortalShell>
      </ContextoPortalProvider>
    </Suspense>
  );
}
