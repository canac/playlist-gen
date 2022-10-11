import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { AuthenticationError, AuthorizationError } from "blitz";
import { Suspense } from "react";
import { withBlitz } from "app/blitz-client";
import { emotionCache } from "app/emotion-cache";

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>;
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
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "light",
        }}
        emotionCache={emotionCache}
      >
        <NotificationsProvider>
          <ModalsProvider>
            <Suspense fallback="Loading...">{getLayout(<Component {...pageProps} />)}</Suspense>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </ErrorBoundary>
  );
}

export default withBlitz(MyApp);
