import Head from "next/head"; // Make sure to import Head from 'next/head'
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/L.png" />
        <title>Profile</title>
      </Head>

      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        themes={["dark", "light-theme"]}
      >
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
