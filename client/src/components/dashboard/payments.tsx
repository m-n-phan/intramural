import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Clock, AlertTriangle, RefreshCw, CreditCard } from "lucide-react";
import { Link } from "wouter";
import type { Team } from "@shared/schema";
import type { AnalyticsOverview } from "./analytics";

export function Payments() {
  const { data: analytics, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const stats = [
    {
      title: "Total Revenue",
      value: `$${analytics?.totalRevenue || 0}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      title: "Pending",
      value: `$${analytics?.pendingRevenue || 0}`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
    },
    {
      title: "Overdue",
      value: "$234",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    },
    {
      title: "Refunded",
      value: "$156",
      icon: RefreshCw,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/30"
    }
  ];

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Payments</h2>
        <p className="text-muted-foreground">
          Track team fees and payment status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(teams?.length ?? 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Team</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams && teams.slice(0, 10).map((team) => (
                    <tr key={team.id} className="border-b">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div className="font-medium text-foreground">{team.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-foreground">$75.00</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-foreground">
                          {new Date(team.createdAt || "").toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getPaymentStatusBadge(team.paymentStatus || "")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          {team.paymentStatus === 'paid' ? (
                            <Button variant="ghost" size="sm">
                              View Receipt
                            </Button>
                          ) : (
                            <>
                              <Link href="/checkout">
                                <Button variant="ghost" size="sm">
                                  Pay Now
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm">
                                Send Reminder
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions</h3>
              <p className="text-muted-foreground">
                Payment transactions will appear here once teams are registered
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
