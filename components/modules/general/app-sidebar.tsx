import {
  BarChart,
  Calendar,
  Home,
  Inbox,
  Package,
  Plus,
  Search,
  Settings,
  TicketPercent,
  User,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/trainer",
    icon: Home,
  },
  {
    title:"Create Event",
    url:"/trainer/create-event",
    icon:Plus,
  },
  {
    title:"Packages & Memberships",
    url:"/trainer/packages-memberships",
    icon:Package,
  },
  // {
  //   title: "Sessions",
  //   url: "/trainer/sessions",
  //   icon: Calendar,
  // },
  // {
  //   title: "Packages",
  //   url: "/trainer/packages",
  //   icon: Package,
  // },
  // {
  //   title: "Appointments",
  //   url: "/trainer/appointments",
  //   icon: Calendar,
  // },
  {
    title: "Clients",
    url: "/trainer/clients",
    icon: Users,
  },
  {
    title: "Progress Management",
    url: "/trainer/progress-management",
    icon: BarChart,
  },
  {
    title: "Discount Codes",
    url: "/trainer/discount-codes",
    icon: TicketPercent,
  },
  {
    title: "Public Page",
    url: "/trainer/public-page",
    icon: User,
  },
  {
    title: "Settings",
    url: "/trainer/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
