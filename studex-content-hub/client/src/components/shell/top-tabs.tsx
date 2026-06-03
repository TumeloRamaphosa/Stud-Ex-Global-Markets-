import { Link } from "wouter";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/cn";

type TopTabsProps = {
  currentPath: string;
};

export function TopTabs({ currentPath }: TopTabsProps) {
  return (
    <nav className="top-tabs" aria-label="Workspace sections">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn("top-tab", currentPath === item.href && "is-active")}
        >
          <span className="top-tab-label">{item.label}</span>
          <span className="top-tab-copy">{item.description}</span>
        </Link>
      ))}
    </nav>
  );
}
