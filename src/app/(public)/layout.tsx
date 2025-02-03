import { ReactNode } from "react";
import PublicFooter from "./_components/PublicFooter";
import PublicNavBar from "./_components/PublicNavBar";

export default function PublicLayout({ 
  children 
} : { 
  children: ReactNode 
}) {
  return (
    <div className='public-layout min-h-screen flex flex-col items-center'>
      <PublicNavBar />
      <div className="flex-1 flex w-full py-12">
        {children}
      </div>
      <PublicFooter />
    </div>
  )
}
