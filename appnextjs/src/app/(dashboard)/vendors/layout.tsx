import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendors | Flexcoz',
  description: 'Manage your vendor relationships.',
};

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
