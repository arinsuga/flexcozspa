import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sheet Groups | Flexcoz',
  description: 'Manage sheet groups for organizing contract and order sheets.',
};

export default function SheetGroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
