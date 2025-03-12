import { ReactNode } from 'react'
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import { ProtectedNavBar } from './_components/ProtectedNavBar'
import { Toaster } from '@/components/ui/toaster'
import ProtectedHeader from './_components/ProtectedHeader'

export default async function ProtectedLayout({ 
  children
} : { 
  children: ReactNode 
}) {

  

  return (
    <SidebarProvider>
      <ProtectedNavBar />
      <SidebarInset>
        <ProtectedHeader />
        <div className='protected-layout flex justify-center w-full h-full'>
          <div className='w-full p-6 max-w-[1500px]'>
              {children}
              <Toaster />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
