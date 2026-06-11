import { redirect } from 'next/navigation';

export default function EndUserLoginPageRedirect() {
  redirect('/signin');
}
