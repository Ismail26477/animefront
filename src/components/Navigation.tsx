"use client"

import { Search, Bell, User, LogOut } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SearchModal } from "./SearchModal"
import { useState } from "react"

const Navigation = () => {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Anime", path: "/anime" },
  ]

  return (
    <nav className="w-full bg-black px-4 md:px-8 py-3 transition-all border-b border-foreground/10 relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {/* <img src="/logo.png" alt="ANIDOST Logo" className="h-8 w-auto" /> */}
            <span className="hidden sm:inline text-lg font-bold text-white">An!dost</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-foreground/10"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-foreground/10">
            <Bell className="h-5 w-5" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-foreground/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-foreground/10">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  )
}

export default Navigation
