import { Suspense } from 'react';
import { Store, ShoppingBag, ArrowRight } from 'lucide-react';
import { StoreSearch } from '@/components/shared/store-search';
import { CategoryFilter } from '@/components/shared/category-filter';
import { publicApi, type Store as StoreType } from '@/lib/api';
import Link from 'next/link';

async function getStores(categoryId?: number) {
  try {
    const data = await publicApi.stores.list(1, 50, categoryId);
    return data.data;
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const data = await publicApi.storesCategories.list(1, 50);
    return data.data;
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;

  const [stores, categories] = await Promise.all([
    getStores(categoryId),
    getCategories(),
  ]);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <main className='max-w-360 mx-auto px-6 lg:px-12 py-8 md:pb-24'>
        <div className='md:hidden mb-6'>
          <StoreSearch />
        </div>

        <section className='mb-12'>
          <Suspense
            fallback={
              <div className='flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className='px-6 py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse h-10 w-20'
                  />
                ))}
              </div>
            }
          >
            <CategoryFilter categories={categories} />
          </Suspense>
        </section>

        <section className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              <Store className='h-6 w-6 text-sky-700 dark:text-sky-400' />
              Tiendas Aliadas
            </h3>
          </div>

          {stores.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 px-4'>
              <div className='relative mb-6'>
                <div className='w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                  <ShoppingBag className='h-12 w-12 text-slate-400 dark:text-slate-600' />
                </div>
                <div className='absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center'>
                  <Store className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                </div>
              </div>
              <h4 className='text-xl font-semibold text-slate-900 dark:text-white mb-2'>
                No hay tiendas disponibles
              </h4>
              <p className='text-slate-500 dark:text-slate-400 text-center max-w-md mb-6'>
                Actualmente no hay tiendas aliadas en esta categoría. Explora
                otras categorías o vuelve más tarde.
              </p>
              <Link
                href='/'
                className='inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer'
              >
                Ver todas las tiendas
                <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {stores.map((store: StoreType) => {
                const isOpen =
                  store.ha && store.hc
                    ? (() => {
                        const now = new Date();
                        const currentTime =
                          now.getHours() * 60 + now.getMinutes();
                        const [openH, openM] = store.ha.split(':').map(Number);
                        const [closeH, closeM] = store.hc
                          .split(':')
                          .map(Number);
                        const openTime = openH * 60 + openM;
                        const closeTime = closeH * 60 + closeM;
                        return (
                          currentTime >= openTime && currentTime <= closeTime
                        );
                      })()
                    : true;

                return (
                  <a
                    key={store.id}
                    href={`/aliados/${store.id}`}
                    className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col group cursor-pointer ${
                      !isOpen ? 'opacity-75' : ''
                    }`}
                  >
                    <div className='relative h-44'>
                      <img
                        alt={`Fondo ${store.name}`}
                        className='w-full h-full object-cover'
                        src={store.coverImage || store.image}
                      />
                      {!isOpen && (
                        <div className='absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[1px]'>
                          <span className='text-white font-bold text-xl drop-shadow-md'>
                            Cerrado
                          </span>
                        </div>
                      )}
                      <div
                        className={`absolute -bottom-6 left-4 w-16 h-16 rounded-xl border-4 border-white dark:border-slate-900 overflow-hidden bg-white dark:bg-slate-900 shadow-md z-10 ${
                          !isOpen ? 'grayscale' : ''
                        }`}
                      >
                        <img
                          alt={`Logo ${store.name}`}
                          className='w-full h-full object-cover'
                          src={store.image}
                        />
                      </div>
                    </div>
                    <div className='pt-8 pb-6 px-5 flex-1 flex flex-col'>
                      <h4 className='font-bold text-lg text-slate-950 dark:text-white mb-1'>
                        {store.name}
                      </h4>
                      <p className='text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider'>
                        {store.category?.name}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
