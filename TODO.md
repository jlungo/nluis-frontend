# Project TODOs

This file mirrors the in-repo task list created during the bundle-size investigation.

- [x] Run project build
  - Run the frontend build command in workspace root `C:\Users\hg\NLUIS4\nluis-frontend` and capture output
  - Status: completed

- [ ] Preview production build
  - Start a local preview server and sanity-check the built app in `dist/` (`npm run preview`)
  - Status: not-started

- [ ] Investigate large bundles
  - Analyze Vite/Rollup bundle sizes: `mapbox-gl` and app chunk exceed 500 KB; propose splitting and optimizations
  - Status: not-started

- [ ] Lazy-load zoning map
  - Make `ShapefileMap` (and heavy zoning map components) dynamically imported in `MapDialog` to split mapbox into a separate chunk
  - Status: not-started

- [ ] Add manualChunks for mapbox-gl (recommended next action)
  - Edit `vite.config.ts` and add `build.rollupOptions.output.manualChunks` to create a named `mapbox-gl` vendor chunk and other vendor chunks. Example:

```ts
// vite.config.ts (snippet)
export default defineConfig({
  // ...existing config...
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/mapbox-gl')) return 'mapbox-gl';
          if (id.includes('node_modules/react-map-gl')) return 'react-map-gl';
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  }
});
```

  - Status: not-started

- [ ] Run build & compare sizes
  - Run `npm run build` after changes and compare chunk sizes to verify `mapbox-gl` moved to a separate chunk and that the main bundle decreased
  - Status: not-started

- [ ] Optional: Visualize bundle
  - Add `vite-plugin-visualizer` to generate an interactive bundling report and commit it to an accessible path for analysis
  - Status: not-started

- [x] Lazy-load subdivision map
  - `SubdivisionMapViewer` was converted to a dynamic import in `src/components/subdivision/SubdivisionShell.tsx` and wrapped with `Suspense`.
  - Status: completed

---

Notes & next recommended action

- The build succeeds but `mapbox-gl` is large (~1.6 MB minified). The quickest, lowest-risk improvement is to add the `manualChunks` rule in `vite.config.ts` (see snippet above) and then rerun `npm run build` to confirm chunking behavior.
- Alternative or additive improvements: lazy-load other map-heavy components (e.g., `ShapefileMap`, `TanzaniaMapViewer`, `FormMapViewer`), or serve `mapbox-gl` via CDN/external script.

If you'd like, I can implement the `manualChunks` change now and run a build to report the updated chunk sizes.
