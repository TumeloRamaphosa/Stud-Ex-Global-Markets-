import { Redirect, Route, Router, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { MobileBottomNav } from "@/components/shell/mobile-bottom-nav";
import { StickyAnalyticsStrip } from "@/components/shell/sticky-analytics-strip";
import { TokenExpiryBanner } from "@/components/shell/token-expiry-banner";
import { TopTabs } from "@/components/shell/top-tabs";
import { AdsWorkspace, CalendarWorkspace, ContentWorkspace, StrategyWorkspace } from "@/features/studex-hub";

function ShellFrame() {
  const [location] = useLocation();

  return (
    <div className="app-shell">
      <header className="hero-shell">
        <div className="logo-lockup">
          <img src="/studex-logo.svg" alt="StudEx logo" className="logo-image" />
          <div className="logo-copy stack-2xs">
            <span className="logo-kicker">StudEx Content Hub</span>
            <h1>Light-pink publishing command center with purple neon signal</h1>
          </div>
        </div>
        <p className="hero-copy">
          Built for content approval, direct social posting, Facebook ad planning, June 2026 scheduling, and strategy alignment.
        </p>
        <StickyAnalyticsStrip />
        <TokenExpiryBanner />
        <TopTabs currentPath={location} />
      </header>

      <main className="main-shell">
        <Switch>
          <Route path="/" component={() => <Redirect to="/content" />} />
          <Route path="/content" component={ContentWorkspace} />
          <Route path="/ads" component={AdsWorkspace} />
          <Route path="/calendar" component={CalendarWorkspace} />
          <Route path="/strategy" component={StrategyWorkspace} />
          <Route component={() => <Redirect to="/content" />} />
        </Switch>
      </main>

      <MobileBottomNav currentPath={location} />
    </div>
  );
}

export function App() {
  return (
    <Router hook={useHashLocation}>
      <ShellFrame />
    </Router>
  );
}
