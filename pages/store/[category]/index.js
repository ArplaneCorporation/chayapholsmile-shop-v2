import { useRouter } from "next/router";
import Layout from "../../../components/layouts/main-layout";
import { useEffect, useState } from "react";
import ProductCard from "../../../components/ui/cards/product-card";
import { withInitProps } from "../../../utils/get-init-data";
import axios from "axios";
import LoadingSpiner from "../../../components/ui/loader/spiner";
import Image from "next/image";

const DynamicCategory = (props) => {
  const router = useRouter();
  const cid = router.query.category;

  const [products, setProducts] = useState(props.products);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const { data } = await axios.get(`/api/products?cid=${cid}`);
        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (cid) {
      getAllProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  return (
    <Layout>
      <main className="max-w-[1150px] sm:px-[17px] pb-4 sm:pb-[25px] pt-24 md:pt-28 mx-auto items-center">
        <h1 className="text-center text-2xl md:text-4xl font-bold mb-4 md:mb-8">
          หมวดหมู่ {props.category?.name}
        </h1>

        {props.configs?.website_banner && (
          <section
            id="banner"
            className="flex justify-center items-center aspect-[16/3.5] relative overflow-hidden md:rounded-lg md:mx-2 mb-4 md:mb-6 lg:mb-8"
          >
            <Image
              alt="homepage_banner"
              src={props.configs.website_banner}
              draggable="false"
              fill
              className="select-none object-cover"
              priority
            />
          </section>
        )}

        {loading ? (
          <LoadingSpiner />
        ) : (
          <div className="px-4 md:px-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 justify-start gap-2 md:gap-4 lg:gap-6">
            {products?.map((product, i) => (
              <ProductCard key={i} product={product} />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default DynamicCategory;

export const getServerSideProps = withInitProps(async (ctx) => {
  try {
    const cid = ctx.params.category;

    const nextRequestMeta =
      ctx.req[
        Reflect.ownKeys(ctx.req).find((s) => String(s) === "Symbol(NextRequestMeta)")
      ];
    const protocol = nextRequestMeta._protocol;
    const host = ctx.req.headers.host;

    const resCategory = await axios.get(`${protocol}://${host}/api/categories/${cid}`);

    if (resCategory.data.category?.type === "ID_PASS") {
      return {
        redirect: {
          destination: `/store/idpass/${cid}`,
          permanent: true,
        },
      };
    }

    const resProducts = await axios.get(`${protocol}://${host}/api/products?cid=${cid}`);
    const resConfigs = await axios.get(`${protocol}://${host}/api/configs`);

    return {
      props: {
        products: resProducts.data.products,
        category: resCategory.data.category,
        configs: resConfigs.data,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true,
    };
  }
});
