import {
  BarChart,
  Calendar,
  Home,
  Inbox,
  Package,
  Search,
  Settings,
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
    title: "Sessions",
    url: "/trainer/sessions",
    icon: Calendar,
  },
  {
    title: "Packages",
    url: "/trainer/packages",
    icon: Package,
  },
  {
    title: "Appointments",
    url: "/trainer/appointments",
    icon: Calendar,
  },
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
    <Sidebar>
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
