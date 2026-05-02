"use client";

import { useSession, signOut } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Bell, LogOut, User } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden lg:block">
        <h2 className="text-sm font-medium text-muted-foreground">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/admin/notifications" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <Bell className="h-5 w-5" />
        </Link>

        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="flex items-center gap-2" />}>
              <Avatar className="h-7 w-7">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="text-xs">
                  {getInitials(session.user.name || "A")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm">
                {session.user.name}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem render={<Link href="/" />}>
                <User className="mr-2 h-4 w-4" /> View Store
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
