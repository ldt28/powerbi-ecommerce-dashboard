import { type ComponentType, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

type UserRole = "admin" | "user";

export function withProtectedRoute<P extends object>(
  Component: ComponentType<P>,
  requiredRole?: UserRole
) {
  function ProtectedRoute(props: P) {
    const { data: user, isLoading, isError } = trpc.auth.me.useQuery(undefined, {
      retry: false,
      staleTime: 60_000,
    });

    const authorized = Boolean(user) && (!requiredRole || user?.role === requiredRole);

    useEffect(() => {
      if (!isLoading && (!user || isError)) {
        const loginUrl = getLoginUrl();
        window.location.assign(loginUrl === "#" ? "/" : loginUrl);
      }
    }, [isError, isLoading, user]);

    if (isLoading || (!user && !isError)) {
      return (
        <main className="min-h-screen grid place-items-center bg-background text-foreground">
          <p role="status" className="text-sm text-muted-foreground">Checking your session…</p>
        </main>
      );
    }

    if (!authorized) {
      return (
        <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
          <section className="max-w-md text-center space-y-3">
            <h1 className="text-2xl font-semibold">Access denied</h1>
            <p className="text-muted-foreground">
              Your account does not have permission to view this page.
            </p>
          </section>
        </main>
      );
    }

    return <Component {...props} />;
  }

  ProtectedRoute.displayName = `withProtectedRoute(${Component.displayName || Component.name || "Component"})`;
  return ProtectedRoute;
}
