import { Outlet, NavLink } from "react-router";
import { useAuth } from "@/store/auth";

export default function MeLayout() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="xl:container mx-auto px-4 py-6 flex gap-6">
      <aside className="w-52 shrink-0 space-y-2">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            My account
          </div>
          <div className="text-sm font-medium truncate">
            {user.first_name || user.last_name
              ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
              : user.email}
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          <MeNavLink to="/me/dashboard">Dashboard</MeNavLink>
          <MeNavLink to="/me/bills">My Bills</MeNavLink>
          {/* Placeholders for future sections */}
          <MeNavLink to="/me/orders" disabled>
            My Orders
          </MeNavLink>
          <MeNavLink to="/me/downloads" disabled>
            My Downloads
          </MeNavLink>
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

interface MeNavLinkProps {
  to: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function MeNavLink({ to, children, disabled }: MeNavLinkProps) {
  if (disabled) {
    return (
      <div className="px-2 py-1.5 rounded-md text-muted-foreground/60 cursor-not-allowed">
        {children}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-2 py-1.5 rounded-md transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted"
        }`
      }
      end
    >
      {children}
    </NavLink>
  );
}
