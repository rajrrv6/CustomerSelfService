import { redirect } from 'next/navigation';

export default function LoginResetPasswordPageRedirect() {
  redirect('/signin');
}
