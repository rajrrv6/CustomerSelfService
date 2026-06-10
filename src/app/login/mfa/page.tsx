import { redirect } from 'next/navigation';

export default function LoginMfaPageRedirect() {
  redirect('/signin');
}
