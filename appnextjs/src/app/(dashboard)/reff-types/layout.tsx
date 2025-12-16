import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reference Types | Flexcoz',
  description: 'Manage reference types for your contracts and orders.',
};

export default function ReffTypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
