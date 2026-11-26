import { ContextoPortalProvider } from "@/components/layout/contexto-portal";
import { PortalShell } from "@/components/layout/portal-shell";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ContextoPortalProvider>
      <PortalShell>{children}</PortalShell>
    </ContextoPortalProvider>
  );
}
