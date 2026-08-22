from pydantic import BaseModel
from typing import List, Dict, Any

class PopularServiceStat(BaseModel):
    name: str
    count: int
    percentage: float

class MonthlyRevenueStat(BaseModel):
    month: str
    revenue: float

class DashboardAnalyticsOut(BaseModel):
    totalCustomers: int
    totalEmployees: int
    todayBookings: int
    pendingBookings: int
    completedBookings: int
    cancelledBookings: int
    todayRevenue: float
    monthlyRevenue: float
    popularServices: List[PopularServiceStat]
    revenueByMonth: List[MonthlyRevenueStat]
