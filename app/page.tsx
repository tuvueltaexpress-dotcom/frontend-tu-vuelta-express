import { Navbar } from '@/components/shared/navbar';
import { BottomNav } from '@/components/shared/bottom-nav';
import { Search, Store, ShoppingCart } from 'lucide-react';

const categories = [
  { name: 'Todas', active: true },
  { name: 'Alimentos', active: false },
  { name: 'Moda', active: false },
  { name: 'Electrónica', active: false },
  { name: 'Hogar', active: false },
  { name: 'Servicios', active: false },
];

const stores = [
  {
    id: '1',
    name: 'Taco King',
    category: 'Comida Mexicana',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCVM48exOyRcwjsn56KOi7iVunJKnc2YUnr8HELB5GZ9XAaAjUHf4z7GAlbQM04JHplnJKMum5KHKUIydTFLau4SRj1PzTo9ooRV_q0AqLPmKVljprSVSWHImAXSkQ0Y-tx4KohUDTmZZVdLxvVdc1Do1OCb1bkLhnEQ4yMQjpFbGBdw-Ba4SP6RzQW_lWHvM2tTBi1WHEk3hD1VkTIQBNYwucpsJhWUfEHmH4ZhdwDRPVnbIc3bCy3kZ0P_L3uQlijPLMXRxlU9qM',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPs1YgKlzl9tKu7mAcoWd2VXj7m_6jYvuBNR65St9GudzyjIyK3DOIt_OPFySPCLnZ8dzbL8dLm6AAgrb-6HjpPPPCbc_suCVo8avcM5mrCJIpsz4L2AOcxzgj7YCySDZ9KPDc6eJXIAZ1DiIuoTGlG-zTCGlQIs7qNA0ZwJW3qdiGXSQ5gjuxdPXLX55n18YX_Hm-XIrB7KYq1NkF-iWZ6_4b4n8JpI36CSJ9w85O_mWPqN55TjcgqKC8SnmGfzZI0V4IXJlY9Xw',
    open: true,
  },
  {
    id: '2',
    name: 'Pizza Art',
    category: 'Alimentos',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvBdxj899LtOWOx_NO5EYsEQFPPxQtHtlUZMdEXLOCsY7nQy4jOiM-kkuFfBikWX_C-MQSK20YYzmbaDYxpwHs65UND_ePqXEmG8Hm_hyONdH24-B5az4AfUxiu_J5UR86c2QdghTvqPzAtAiTG0g5iwNZzVCyDxsftX38ZhQjdvMLQewZ2Ny9XBgqfZ0ZyW19xaOxOcfpXrrAzofcoBwJgbwtKf6YixclLvmtMWMI1X6gmov8mmtLhArwsIQSqIcIgpLCfQKXaQE',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiz35fWcbcsPPzukqRSAb_BbYwVYbpgIFvz2-AX6Isd7xn0CZN_w-RfvNJQo3UeXq0Inqywf0k8nYTwpXlaX5GDAEOAFTIKgGkBxHVsmDwxFTKPQlhnyMWYCmOoGqA001k5Q1xGIRuNzvOgm6t8-jSUacFRWCteDFudPVLHfvgyNpAGB9u8E9HZviPwYv7JUxDEoWo66p7QteBBF-nU7HXTvv5iMYN-uwZiS-YbC5unf8iDOBA-lykQ3A2iQjIkR3uKbS_PhDXIPw',
    open: false,
  },
  {
    id: '3',
    name: 'Burger Loft',
    category: 'Alimentos',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgtX2E2dsv0oZt6pLHktyaHjENK7zF4qaxki-XZnwZb81R7dRWw2QNE6X3RDWiHbdkG2Kii2mvnEBXa9j_XVL5Vq3vtTCRxWuxGASzL9jkV8xdGEvhaz3PT4kGNnN7tc2BsJy8x_z437EwvC9_jaQi8DL1466BgWqS7At6xyvhhGQkGqrq8MQ9v-Njh8s7D9yiJKo21xmPpXrYt-Thscfi_EyUz9X6k17gC051z9-swUW9esCui9KJ8Wf33adgSX0LGOpVgL9zlws',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsNmAS6PAgVcHn4gHJbqm41K4iS2SjBy_-V6NmHXa0RyRYvPaWnm-Imc4T584tS09emT4-BasV-uQEnZfyuzHPNVg1DWFRHkc7b1EXJKDioDL5DHUL-TatYHFgA4RY5zSedc2V4Bn_IJ8hhUdfQfT3jDUPnmZ-cPDF313iD24x6WFzQg5OXrPtWhpnzIlEtmZPlmzNGeB7peZP08QcW9fgyMWK7GrWR8-mXM4mLdagQpbLT_yrwrrCE_5XubxW7mnXRDmFT-lGX0U',
    open: true,
  },
  {
    id: '4',
    name: 'The Kitchen',
    category: 'Servicios',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABFMBP4eUfeSGiykThJ56zulre-KgWAWfzeOmof5eUW0eBeUEiivK3_w-nz8xkA6Ij5nVm34VjUbIpBPK9K_8onmAc9bME7ljD8LC9MeZkEXsXCRIz3384vwnqo2O-U11QfBNWrn_JceGr1IHzlU_AYCdqQkhtpuWV6S8WtgVZ5k-ICFVvc2lvV56QdgF4GKopcab5WHwEr9DR9qlju_ciCXwIcxGdhbtAvjWWLPKFlDdXc5R_pv7k04yd3GfzFkkrS6wiIUtv9A0',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3odmKLgCoFBaZs3aQlekgI7kOf6_lIejzYY2YIjnVtJcalxyZoVQPivw_6YfTQt59Pcac1ZTb_d7P4DP3eUY9jwFxUHpO53C8mTOA5sSFv_fSfKAoEv7wcim5UNmKS2XYBl0BbMGzKKu-yyjc8nHDXPEkuV3jSi4k2w6EphmETzQYmKD98QDP3jzyONBMXd3JquzDNWTAr7gUUPCOSre1BmFE2LHdwOIFck20u0GrNS3BSNiIQRPlhqhWQPyQSZjnqOuwPl2OBwk',
    open: false,
  },
];

export default function HomePage() {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <main className='max-w-[1440px] mx-auto px-6 lg:px-12 py-8 md:pb-24'>
        <div className='md:hidden mb-6'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400' />
            <input 
              className='w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-700 focus:border-transparent transition-all text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400' 
              placeholder='Buscar tiendas...' 
              type='text'
            />
          </div>
        </div>

        <section className='mb-12'>
          <div className='flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar'>
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`px-6 py-2.5 font-semibold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  cat.active
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-sky-700 hover:text-sky-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-sky-500 dark:hover:text-sky-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        <section className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              <Store className='h-6 w-6 text-sky-700 dark:text-sky-400' />
              Tiendas Aliadas
            </h3>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {stores.map((store) => (
              <div
                key={store.id}
                className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col group cursor-pointer ${
                  !store.open ? 'opacity-75' : ''
                }`}
              >
                <div className='relative h-44'>
                  <img
                    alt={`Fondo ${store.name}`}
                    className='w-full h-full object-cover'
                    src={store.image}
                  />
                  {!store.open && (
                    <div className='absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[1px]'>
                      <span className='text-white font-bold text-xl drop-shadow-md'>
                        Cerrado
                      </span>
                    </div>
                  )}
                  <div
                    className={`absolute -bottom-6 left-4 w-16 h-16 rounded-xl border-4 border-white dark:border-slate-900 overflow-hidden bg-white dark:bg-slate-900 shadow-md z-10 ${!store.open ? 'grayscale' : ''}`}
                  >
                    <img
                      alt={`Logo ${store.name}`}
                      className='w-full h-full object-cover'
                      src={store.logo}
                    />
                  </div>
                </div>
                <div className='pt-8 pb-6 px-5 flex-1 flex flex-col'>
                  <h4 className='font-bold text-lg text-slate-950 dark:text-white mb-1'>
                    {store.name}
                  </h4>
                  <p className='text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider'>
                    {store.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
