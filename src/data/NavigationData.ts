import {
  LayoutDashboard,
  ArrowRightLeft,
  LucideProps,
  CaseUpper,
  BadgeDollarSign,
} from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes } from "react";


export const NavigationData = [
  {
    title: "Overview",
    subItems: [
      {
        name: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Getting Started",
    subItems: [
      // {
      //   name: "Planner",
      //   url: "/planner",
      //   icon: Notebook,
      //   isDisabled: true
      // },
      {
        name: "Transactions",
        url: "/transactions",
        icon: ArrowRightLeft,
      },
    ],
  },
]

export const SettingsData = [
  {
    title: "Settings",
    subItems: [
      {
        name: "Style Guide",
        url: "/style-guide",
        icon: CaseUpper,
      },
      {
        name: "Subscription",
        url: "/subscription",
        icon: BadgeDollarSign,
      },
    ]
  }
]

export type TNavigationData = {
  title: string;
  subItems: {
      name: string;
      url: string;
      icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
      isDisabled?: boolean
  }[];
}[]

function createNavigationMap(
  NavigationData: TNavigationData
) {

  const allPossiblePaths = new Set<string>()
  NavigationData.map((group) => {
    group.subItems.map(item => {
      allPossiblePaths.add(`${group.title}/${item.name}`)
    })
  })

  return allPossiblePaths
}

export const allPossiblePaths = createNavigationMap(NavigationData)