import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contracts | Flexcoz',
  description: 'Manage your contracts efficiently.',
};

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
