import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to tasks page as the default
  redirect('/tasks');
}
