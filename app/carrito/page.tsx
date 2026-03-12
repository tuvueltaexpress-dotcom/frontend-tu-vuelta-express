import { redirect } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { CarritoClient } from './carrito-client';

async function getDeliveryOptions() {
  try {
    const data = await publicApi.deliveryOptions.list(1, 20);
    return data.data;
  } catch {
    return [];
  }
}

export default async function CarritoPage() {
  const deliveryOptions = await getDeliveryOptions();
  
  return <CarritoClient deliveryOptions={deliveryOptions} />;
}
