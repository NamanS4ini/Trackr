import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notes - Trackr',
  description: 'View your daily notes and habit reflections',
};

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
