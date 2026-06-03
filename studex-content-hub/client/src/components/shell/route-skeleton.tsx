import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type RouteSkeletonProps = {
  eyebrow: string;
  title: string;
  description: string;
  yaml: string;
};

export function RouteSkeleton({ eyebrow, title, description, yaml }: RouteSkeletonProps) {
  return (
    <div className="stack-xl">
      <Card className="stack-md">
        <div className="stack-sm">
          <span className="section-eyebrow">{eyebrow}</span>
          <h2 className="section-title">{title}</h2>
          <p className="section-copy">{description}</p>
        </div>

        <div className="skeleton-grid">
          <div className="stack-sm">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
          <div className="stack-sm">
            <h3 className="config-title">YAML-ready shell config</h3>
            <pre className="config-preview">{yaml}</pre>
          </div>
        </div>
      </Card>

      <div className="three-up-grid">
        <Card className="stack-sm">
          <span className="mini-label">Shared state</span>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full" />
        </Card>
        <Card className="stack-sm">
          <span className="mini-label">Responsive rail</span>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-16 w-full" />
        </Card>
        <Card className="stack-sm">
          <span className="mini-label">Future module slot</span>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>
    </div>
  );
}
