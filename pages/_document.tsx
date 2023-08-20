import { ServerStyles, createStylesServer } from "@mantine/next";
import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";
import { emotionCache } from "app/emotion-cache";

const stylesServer = createStylesServer(emotionCache);

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: [
        initialProps.styles,
        <ServerStyles html={initialProps.html} server={stylesServer} key="styles" />,
      ],
    };
  }

  render() {
    return (
      <Html
        lang="en"
        style={{
          // Prevent focused elements from being obscured by the sticky header when navigating with tab
          scrollPaddingTop: "80px",
        }}
      >
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
