import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, PieChart, Wallet, Zap, Shield, TrendingUp } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <PieChart className="h-6 w-6 mb-2" />,
      title: "Smart Analytics",
      description: "Gain insights into your spending habits with AI-powered analytics and visualizations.",
    },
    {
      icon: <Wallet className="h-6 w-6 mb-2" />,
      title: "Secure Transactions",
      description: "Bank-level encryption ensures your financial data remains safe and private.",
    },
    {
      icon: <BarChart2 className="h-6 w-6 mb-2" />,
      title: "Real-time Tracking",
      description: "Monitor your expenses and income in real-time, with instant updates across all devices.",
    },
    {
      icon: <Zap className="h-6 w-6 mb-2" />,
      title: "Automated Budgeting",
      description: "Let AI create personalized budgets based on your spending patterns and financial goals.",
    },
    {
      icon: <Shield className="h-6 w-6 mb-2" />,
      title: "Bill Protection",
      description: "Never miss a payment with smart reminders and automated bill tracking.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 mb-2" />,
      title: "Investment Insights",
      description: "Get tailored investment recommendations and track your portfolio performance.",
    },
  ]

  return (
    <section className="mysection">
      <div className="mycontainer">

        <div className="text-center mb-12">
          <p className="">Powerful Features for Financial Success</p>
          <p className="">Discover how our app empowers you to take control of your finances</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-color-border shadow-none">
              <CardHeader>
                <CardTitle className="flex flex-col items-center text-center">
                  {feature.icon}
                  {feature.title}
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

