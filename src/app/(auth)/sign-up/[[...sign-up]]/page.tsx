import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className='sign-up h-screen flex items-center justify-center'>
        <SignUp />
    </div>
  )
}
