import { Outlet } from "react-router";
import bibiNaBwana from "@/assets/bibi_na_bwana.png";
import logo from "@/assets/nluis.png";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page content goes here */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer stays */}
      <footer className="bg-background border-t border-primary/10">
        <div className="xl:container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="NLUPC Logo"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <div className="font-semibold text-primary">NLUPC</div>
                  <div className="text-xs text-muted-foreground">
                    National Land Use Planning Commission
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Supporting sustainable land use planning across Tanzania
                through digital innovation and comprehensive policy
                implementation.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Contact & Support</h4>
              <div className="space-y-2 text-sm">
                <div>
                  Email:{" "}
                  <a
                    href="mailto:support@nlupc.go.tz"
                    className="hover:underline hover:text-blue-500"
                  >
                    support@nlupc.go.tz
                  </a>
                </div>
                <div>
                  Phone:{" "}
                  <a
                    href="tel:+255262324021"
                    className="hover:underline hover:text-blue-500"
                  >
                    +255 26 232 4021
                  </a>
                </div>
                <div>
                  Help:{" "}
                  <a href="#" className="hover:underline hover:text-blue-500">
                    Help Center
                  </a>
                </div>
                <div>National Land Use Planning Commission</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-primary">
                Contact Information
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>National Land Use Planning Commission</div>
                <div>P.O. Box 950, Dodoma, Tanzania</div>
                <div>Email: info@nlupc.go.tz</div>
                <div>Phone: +255 26 232 4021</div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/10 mt-8 pt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={bibiNaBwana}
                alt="Tanzania Coat of Arms"
                className="h-8 w-8 object-contain"
              />
              <div className="text-xs text-muted-foreground">
                © 2025 United Republic of Tanzania. All rights reserved.
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Official Government System • NLUIS v2.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
