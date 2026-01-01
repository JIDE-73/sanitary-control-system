import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, AlertTriangle, CheckCircle } from "lucide-react"

const stats = [
  {
    title: "Afiliados Activos",
    value: "2,847",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Certificados Vigentes",
    value: "1,234",
    change: "+8%",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Por Vencer (7 días)",
    value: "89",
    change: "-5%",
    changeType: "negative" as const,
    icon: AlertTriangle,
  },
  {
    title: "Exámenes Pendientes",
    value: "156",
    change: "+3%",
    changeType: "neutral" as const,
    icon: CheckCircle,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.changeType === "positive"
                  ? "text-accent"
                  : stat.changeType === "negative"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {stat.change} vs mes anterior
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
