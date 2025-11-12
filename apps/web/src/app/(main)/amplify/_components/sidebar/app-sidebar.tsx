"use client";

import { type ComponentProps } from "react";

import { type AuthUserSummary } from "@amplify/types";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { OrganizationSelector } from "./organization-selector";

export function AppSidebar({
  currentUser,
  impersonatedBy,
  ...props
}: ComponentProps<typeof Sidebar> & {
  readonly currentUser: AuthUserSummary | null;
  readonly impersonatedBy?: string | null;
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSelector />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        {currentUser ? (
          <NavUser user={currentUser} impersonatedBy={impersonatedBy} />
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
