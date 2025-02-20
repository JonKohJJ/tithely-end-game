import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar, Clock, DollarSign, ListChecks, TrendingDown } from "lucide-react"

export default function Features() {

  const features = [
    {
      icon: <ListChecks className="h-6 w-6 mb-2" />,
      title: "Expense Categorization",
      description: "Automatically sort transactions into categories for a clear view of where your money goes.",
    },
    {
      icon: <Clock className="h-6 w-6 mb-2" />,
      title: "Recurring Expenses",
      description: "Track subscriptions, bills, and recurring payments to avoid surprises and plan ahead.",
    },
    {
      icon: <TrendingDown className="h-6 w-6 mb-2" />,
      title: "Spending Limits",
      description: "Set monthly budgets for different categories and get alerts when you're close to overspending.",
    },
    {
      icon: <DollarSign className="h-6 w-6 mb-2" />,
      title: "Income & Expense Tracking",
      description: "Log and monitor all your earnings and expenses in one place for accurate financial management.",
    },
    {
      icon: <Calendar className="h-6 w-6 mb-2" />,
      title: "Financial Planning",
      description: "Plan ahead with goal-based savings and projected expense tracking.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 mb-2" />,
      title: "Detailed Reports",
      description: "Generate custom financial reports and summaries to track progress and make informed decisions.",
    },
  ]
  

  return (
    <section className="mysection">
      <div className="mycontainer">

        <div className="mx-auto max-w-screen-md text-center mb-12">
          <p className="mb-4 fs-h2">Essential Tools for Smarter Money Management</p>
          <p>Track your income, control expenses, and plan for the future with intuitive features designed to simplify budgeting and financial tracking.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-color-border shadow-none">
              <CardHeader>
                <CardTitle className="flex flex-col items-center text-center">
                  {feature.icon}
                  <p className="fs-h3">{feature.title}</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

