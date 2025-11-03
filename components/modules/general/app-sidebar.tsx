"use client";

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
  ChevronDown,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";

// Menu items with subpages support
const items = [
  {
    title: "Dashboard",
    url: "/trainer",
    icon: Home,
  },
  {
    title: "Create Event",
    url: "/trainer/create-event",
    icon: Plus,
    subItems: [
      {
        title: "Manage Appointment",
        url: "/trainer/appointments",
      },
      {
        title: "Manage Session",
        url: "/trainer/sessions",
      },
    ],
  },
  {
    title: "Packages & Memberships",
    url: "/trainer/packages-memberships",
    icon: Package,
    subItems: [
      {
        title: "Packages",
        url: "/trainer/packages",
      },
      {
        title: "Memberships",
        url: "/trainer/memberships",
      },
    ],
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

// Component to conditionally show chevron based on sidebar state
function CollapsibleChevronButton() {
  const { state } = useSidebar();

  if (state === "collapsed") {
    return null;
  }

  return (
    <CollapsibleTrigger asChild>
      <button
        type="button"
        className="flex items-center justify-center w-8 h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors flex-shrink-0"
      >
        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </button>
    </CollapsibleTrigger>
  );
}

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
                  {item.subItems ? (
                    // Item with subpages
                    <Collapsible defaultOpen className="group/collapsible">
                      <div className="flex items-center w-full gap-1">
                        <SidebarMenuButton asChild tooltip={item.title} className="flex-1">
                          <Link
                            href={item.url}
                            className="flex items-center gap-2 w-full"
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        <CollapsibleChevronButton />
                      </div>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    // Regular item without subpages
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}