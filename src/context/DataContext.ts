"use client"
import { createContext } from "react";

type DataContextType = {
    theme: "Light" | "Dark"
    setTheme: React.Dispatch<React.SetStateAction<"Light" | "Dark">>
}

export const DataContext = createContext<DataContextType>({
    theme: "Light",
    setTheme: () => {}
})