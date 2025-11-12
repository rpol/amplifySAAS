"use client";

import type { ComponentProps } from "react";

import Link from "next/link";

import { type AuthUserSummary } from "@amplify/types";
import { Command } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

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
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/amplify/default">
                <Command />
                <span className="text-base font-semibold">
                  {APP_CONFIG.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        {currentUser ? (
          <NavUser user={currentUser} impersonatedBy={impersonatedBy} />
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
