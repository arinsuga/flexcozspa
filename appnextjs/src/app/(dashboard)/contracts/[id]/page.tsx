'use client';

import { useParams } from 'next/navigation';
import ContractDetailClient from './ContractDetailClient';

export default function ContractDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  return <ContractDetailClient id={id} />;
}
