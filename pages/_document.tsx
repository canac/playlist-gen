import { ColorSchemeScript, rem } from "@mantine/core";
import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html
        lang="en"
        style={{
          // Prevent focused elements from being obscured by the sticky header when navigating with tab
          scrollPaddingTop: rem(80),
        }}
      >
        <Head>
          <ColorSchemeScript />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
