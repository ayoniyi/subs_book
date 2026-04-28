import { useSignIn } from '@clerk/expo';
export function Test() {
  const { signIn } = useSignIn();
  let a: keyof typeof signIn;
  a = "";
}
