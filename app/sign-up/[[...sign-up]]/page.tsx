import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '60px 16px' }}>
      <SignUp />
    </main>
  );
}
