'use client';

import { useParams } from 'next/navigation';
import OrderDetailClient from './OrderDetailClient';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  return <OrderDetailClient id={id} />;
}
