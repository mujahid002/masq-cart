import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { GlobalContextProvider } from "../context/Store";
import { MoralisProvider } from "../context/MoralisProvider";

export default function App({ Component, pageProps }) {
  return (
    <GlobalContextProvider>
      <MoralisProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MoralisProvider>
    </GlobalContextProvider>
  );
}
