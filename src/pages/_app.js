import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { GlobalContextProvider } from "@/context/Store";

export default function App({ Component, pageProps }) {
  return (
    <GlobalContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GlobalContextProvider>
  );
}
