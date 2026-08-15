import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ComposePage } from "@/pages/ComposePage";
import { RevealPage } from "@/pages/RevealPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// No `loader` on "/s/:id": data-router loaders auto-run on navigation,
// revalidation, and bfcache restores — exactly the "silent GET that burns
// a view" bug this app must avoid. RevealPage fetches only from an
// explicit button click.
export const router = createBrowserRouter([
  {
    element: (
      <AppShell>
        <Outlet />
      </AppShell>
    ),
    children: [
      { path: "/", element: <ComposePage /> },
      { path: "/s/:id", element: <RevealPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
