import { notFound } from 'next/navigation';
import { publicApi, type Product, type Store } from '@/lib/api';
import { ProductDetailClient } from './product-detail-client';

async function getProduct(idOrSlug: string) {
  try {
    const data = await publicApi.products.get(idOrSlug);
    return data;
  } catch {
    return null;
  }
}

async function getStore(idOrSlug: string) {
  try {
    const data = await publicApi.stores.get(idOrSlug);
    return data;
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const store = await getStore(String(product.storeId));

  const isOpen = store && store.ha && store.hc
    ? (() => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [openH, openM] = store.ha.split(':').map(Number);
        const [closeH, closeM] = store.hc.split(':').map(Number);
        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;
        return currentTime >= openTime && currentTime <= closeTime;
      })()
    : true;

  return (
    <ProductDetailClient
      product={product}
      store={store}
      isOpen={isOpen}
    />
  );
}
