import { CalendarDays, Files, Megaphone, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/cn";

const iconMap = {
  content: Files,
  ads: Megaphone,
  calendar: CalendarDays,
  strategy: Sparkles,
};

type MobileBottomNavProps = {
  currentPath: string;
};

export function MobileBottomNav({ currentPath }: MobileBottomNavProps) {
  return (
    <nav className="mobile-nav" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = iconMap[item.key];
        const isActive = currentPath === item.href;
        return (
          <Link key={item.href} href={item.href} className={cn("mobile-nav-link", isActive && "is-active")}>
            <Icon size={18} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
