#!/usr/bin/env bash
#
# Build the static site for Cloudflare Pages.
#
# Pages project settings:
#   Build command:      bash scripts/build-cloudflare.sh
#   Build output dir:   build/client
#   Env var:            NODE_VERSION = 22   (Vite 6 / React Router 7 need >= 20;
#                                            Pages still defaults to Node 18)
#
set -euo pipefail

# Prerenders every static route into build/client/ and, with ssr:false, drops
# the server build afterwards.
npm run build

# Belt and braces: a Netlify-shaped SPA fallback (`/*  /__spa-fallback.html  200`)
# must never reach Pages. The repo used to ship one in public/ and it broke every
# URL on the deploy, in two ways:
#   1. `/*` matches every request here — including paths that DO have a
#      prerendered asset — so the whole site served the SPA shell.
#   2. The target is a `.html` path, which Pages normalises with a 308 to the
#      extensionless URL. That URL re-matches `/*`, so every request ended in a
#      redirect loop at /__spa-fallback (ERR_TOO_MANY_REDIRECTS).
rm -f build/client/_redirects

# Instead, use the same convention as the GitHub Pages deploy
# (.github/workflows/deploy.yml): Pages serves 404.html for any path with no
# matching asset, so point it at React Router's SPA shell. That covers
# client-side 404s, which render the `*` route. (/docs isn't prerendered either,
# but public/docs/index.html already answers it with a 200 + meta refresh.)
cp build/client/__spa-fallback.html build/client/404.html
