import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage - Trackr',
  description: 'Manage your habits - edit, delete, reorder and export your habit tracking data',
};

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
