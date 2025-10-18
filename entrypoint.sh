#!/bin/sh
rm -rf dist
npm run build
exec npx vite preview --host 0.0.0.0 --port 4173
