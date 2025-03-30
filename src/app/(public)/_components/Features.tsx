import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, ClipboardList, CreditCard, DollarSign, Edit3, PieChart, ShieldCheck, Target, TrendingUp } from "lucide-react"

export default function Features() {

  const features = [
    {
      icon: <DollarSign className="h-6 w-6 mb-2" />, 
      title: "Monthly Expense Tracking",
      description: "Gain insights into your actual spending habits by tracking expenses month over month."
    },
    {
      icon: <PieChart className="h-6 w-6 mb-2" />, 
      title: "Budget Breakdown by Category",
      description: "Compare your original budgeted expenses with actual spending for better financial control."
    },
    {
      icon: <BarChart3 className="h-6 w-6 mb-2" />, 
      title: "Spending Habit Insights",
      description: "Analyze spending patterns to make informed financial decisions and optimize expenses."
    },
    {
      icon: <TrendingUp className="h-6 w-6 mb-2" />, 
      title: "Savings Growth Tracking",
      description: "Monitor your savings progress over time and stay on track with your financial goals."
    },
    {
      icon: <Target className="h-6 w-6 mb-2" />, 
      title: "Goal-Based Savings",
      description: "Set and track savings goals for different categories, ensuring every dollar has a purpose."
    },
    {
      icon: <CreditCard className="h-6 w-6 mb-2" />, 
      title: "Account & Card Management",
      description: "Easily add and manage bank accounts and credit cards in one centralized dashboard."
    },
    {
      icon: <ClipboardList className="h-6 w-6 mb-2" />, 
      title: "Zero-Based Budgeting",
      description: "Ensure every dollar is accounted for by assigning all income to savings, expenses, or investments."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 mb-2" />, 
      title: "Fixed vs. Variable Expense Analysis",
      description: "Understand and categorize your expenses into fixed and variable costs for smarter budgeting."
    },
    {
      icon: <Edit3 className="h-6 w-6 mb-2" />, 
      title: "Accurate Transaction Logging",
      description: "Input and manage every transaction in a dedicated table, ensuring precise analytics and financial insights."
    },
  ]
  

  return (
    <section className="mysection" id="features">
      <div className="mycontainer">

        <div className="mx-auto max-w-screen-md text-center mb-12">
          <p className="mb-4 fs-h2">Essential Features for Smarter Money Management</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

