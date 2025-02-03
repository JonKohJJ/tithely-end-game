import {
    LayoutDashboard,
    ChartNoAxesCombined,
    CreditCard,
    ArrowRightLeft,
    PiggyBank,
    AlignStartVertical,
    LucideProps,
    CaseUpper,
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
        {
          name: "Analytics",
          url: "/analytics",
          icon: ChartNoAxesCombined,
          isDisabled: true
        },
      ],
    },
    {
      title: "Getting Started",
      subItems: [
        {
          name: "Categories",
          url: "/categories",
          icon: AlignStartVertical,
        },
        {
          name: "Cards",
          url: "/cards",
          icon: CreditCard,
          isDisabled: true
        },
        {
          name: "Accounts",
          url: "/accounts",
          icon: PiggyBank,
          isDisabled: true
        },
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
      // {
      //   name: "Dark Mode",
      //   icon: Moon,
      // },
      {
        name: "Style Guide",
        url: "/style-guide",
        icon: CaseUpper,
      },
    ]
  }
]

function createNavigationMap(
  NavigationData: 
  {
      title: string;
      subItems: {
          name: string;
          url: string;
          icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
      }[];
  }[]
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