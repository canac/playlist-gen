import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps, Routes } from "@blitzjs/next";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { AuthenticationError, AuthorizationError } from "blitz";
import Link from "next/link";
import { Suspense } from "react";
import classes from "./app.module.css";
import { withBlitz } from "app/blitz-client";

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return (
      <div className={classes.error}>
        <h1>Authentication Error</h1>
        <p>
          You are not authenticated. Try <Link href={Routes.LoginPage()}>logging in</Link>.
        </p>
      </div>
    );
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    );
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    );
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      <MantineProvider>
        <Notifications />
        <ModalsProvider>
          <Suspense fallback="Loading...">{getLayout(<Component {...pageProps} />)}</Suspense>
        </ModalsProvider>
      </MantineProvider>
    </ErrorBoundary>
  );
}

export default withBlitz(MyApp);
