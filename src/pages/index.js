import Product from "@/components/Product";
import { products } from "@/data/products";
import { useGlobalContext } from "@/context/Store";

export default function Home() {
  const { cartCount, setShouldDisplayCart, removeItemFromCart } =
    useGlobalContext();
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 justify-center mx-auto gap-4 place-center flex-wrap w-100 md:max-w-[900px]">
      {products.map((product) => (
        <Product product={product} key={product.id} />
      ))}
    </div>
  );
}
