import { redirect } from 'next/navigation';

export default function LoginForgotPasswordPageRedirect() {
  redirect('/signin');
}
