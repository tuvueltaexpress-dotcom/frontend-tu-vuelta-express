import { notFound } from 'next/navigation';
import { publicApi, type Store as StoreType, type Product as ProductType, type ProductCategory as ProductCategoryType } from '@/lib/api';
import { StoreDetailClient } from './store-detail-client';

async function getStore(idOrSlug: string) {
  try {
    const data = await publicApi.stores.get(idOrSlug);
    return data;
  } catch {
    return null;
  }
}

async function getStoreProducts(storeId: number) {
  try {
    const data = await publicApi.products.list(1, 50, storeId);
    return data.data;
  } catch {
    return [];
  }
}

async function getStoreCategories(storeId: number) {
  try {
    const data = await publicApi.productsCategories.list(1, 50, storeId);
    return data.data;
  } catch {
    return [];
  }
}

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const store = await getStore(id);

  if (!store) {
    notFound();
  }

  const [products, categories] = await Promise.all([
    getStoreProducts(store.id),
    getStoreCategories(store.id),
  ]);

  const isOpen =
    store.ha && store.hc
      ? (() => {
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const [openH, openM] = store.ha.split(':').map(Number);
          const [closeH, closeM] = store.hc.split(':').map(Number);
          const openTime = openH * 60 + openM;
          const closeTime = closeH * 60 + closeM;
          
          if (closeTime < openTime) {
            return currentTime >= openTime || currentTime <= closeTime;
          }
          return currentTime >= openTime && currentTime <= closeTime;
        })()
      : true;

  return (
    <StoreDetailClient
      store={store}
      products={products}
      categories={categories}
      isOpen={isOpen}
    />
  );
}
