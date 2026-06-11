import { redirect } from 'next/navigation';

export default function ClientAdminLoginPageRedirect() {
  redirect('/signin');
}
