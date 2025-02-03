"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

export function ThemeModeToggle({
  additionalClasses
} : {
  additionalClasses?: string;
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
      className={`theme-toggle flex items-center ${additionalClasses}`}

    >
      { theme === "light" 
        ? <>
            <Moon />
            <p className="hidden md:block">Dark</p>
          </>
        : <>
            <Sun />
            <p className="hidden md:block">Light</p>
          </>
      }
    </Button>
  )
}
