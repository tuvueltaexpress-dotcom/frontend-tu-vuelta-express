'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { StoreCategory } from '@/lib/api';

interface CategoryFilterProps {
  categories: StoreCategory[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get('category');

  const categoryList: { id?: number; name: string }[] = [
    { id: undefined, name: 'Todas' },
    ...categories,
  ];

  const handleCategoryClick = (categoryId?: number) => {
    if (categoryId === undefined) {
      router.push('/');
    } else {
      router.push(`/?category=${categoryId}`);
    }
  };

  return (
    <div className='relative -mx-6 md:-mx-12'>
      <div className='absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent pointer-events-none z-10' />
      <div className='absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none z-10' />

      <div className='flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth px-6 md:px-12 [-webkit-mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)] [mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]'>
        {categoryList.map((cat) => {
          const isActive =
            (cat.id === undefined && !currentCategoryId) ||
            (cat.id !== undefined && String(cat.id) === currentCategoryId);

          return (
            <button
              key={cat.id ?? 'all'}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-6 py-2.5 font-semibold rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-sky-700 hover:text-sky-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-sky-500 dark:hover:text-sky-400'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
