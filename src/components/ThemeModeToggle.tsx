"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

export function ThemeModeToggle({
  additionalClasses,
  onlyIcon
} : {
  additionalClasses?: string;
  onlyIcon?: boolean
}) {

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false);

  // Ensure the component is fully mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Avoid rendering anything until fully hydrated
  }

  return (
    <Button
      onClick={() => theme === "light" ? setTheme("dark") : setTheme("light")}
      className={`theme-toggle flex items-center ${additionalClasses} shadow-none`}

    >
      { theme === "light" 
        ? <>
            <Moon />
            {onlyIcon ? null : <p className="hidden md:block">Dark</p>}
          </>
        : <>
            <Sun />
            {onlyIcon ? null : <p className="hidden md:block">Light</p>}
          </>
      }
    </Button>
  )
}
