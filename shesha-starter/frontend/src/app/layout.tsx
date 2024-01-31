import { unstable_noStore as noStore } from "next/cache";
import React, { Suspense } from "react";
import { AppProvider } from "./app-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();
  const BACKEND_URL =
    process.env.BACKEND_URL ?? "https://function-api-test.shesha.dev";

  return (
    <html lang="en">
      <body>
        <Suspense>
          <AppProvider backendUrl={BACKEND_URL}>{children}</AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
