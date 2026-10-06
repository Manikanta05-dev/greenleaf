import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '60px 16px' }}>
      <SignIn />
    </main>
  );
}
