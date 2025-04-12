import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toaster'
import ProtectedHeader from './_components/ProtectedHeader'

export default async function ProtectedLayout({ 
  children
} : { 
  children: ReactNode 
}) {

  return (
    <div className="protected-layout min-h-screen flex flex-col items-center">
      <ProtectedHeader />
      <div className="max-w-[1500px] w-full pb-24">
        {children}
        <Toaster />
      </div>
    </div>
  )
}
