import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders | Flexcoz',
  description: 'Manage your orders and order sheets.',
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
