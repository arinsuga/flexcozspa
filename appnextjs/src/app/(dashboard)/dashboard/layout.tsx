import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Flexcoz',
  description: 'Overview of your contracts and orders.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
