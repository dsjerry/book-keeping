# Repository Guidelines

This is the React Native 0.73 / TypeScript bookkeeping app (Android-first, iOS supported). Source lives in the app folder; the native Android project is under `android/`.

## Project Structure & Module Organization

- `index.js` / `App.tsx` — app entry and root component
- `src/` — application source:
  - `api/` — network layer, `pages/` — screens, `components/` — reusable UI
  - `hooks/`, `store/`, `contexts/`, `layouts/`, `consts/`, `utils/`, `types/`
- `types/` — shared TypeScript definitions (`base.d.ts`, `keeping.d.ts`, `screen.d.ts`)
- `assets/` — images, icons, fonts
- `__tests__/` — Jest tests (`*.test.tsx`)
- `android/` / `ios/` — native projects; `android/` is the primary build target
- `.github/workflows/android-build.yml` — CI: Android build on push to `main` and PRs to `main`

## Build, Test, and Development Commands

Use yarn (`yarn.lock` is authoritative; CI installs with `--frozen-lockfile`).

- `yarn start` — start the Metro bundler
- `yarn android` / `yarn ios` — run the app on a device/emulator
- `yarn android:dev` — run with `.env.local` (dev config)
- `yarn android:prod` — run a release build with `.env` (prod config)
- `yarn test` — run the Jest test suite
- `cd android && ./gradlew assembleDebug` / `assembleRelease` — build APKs directly via Gradle (no Android Studio required)

## Coding Style & Naming Conventions

- Formatting is enforced by Prettier (`.prettierrc.js`): single quotes, no semicolons, print width 120, trailing commas
- TypeScript for all new code; keep `tsconfig.json` strict settings
- Components in `PascalCase`, hooks as `useCamelCase`, constants as `UPPER_SNAKE_CASE`
- Environment-specific values go through `react-native-config` (`.env` vs `.env.local`); never commit secrets

## Testing Guidelines

- Jest with the `react-native` preset (`jest.config.js`)
- Place tests in `__tests__/` and name them `<module>.test.tsx`
- Run `yarn test` before pushing; keep the existing suite green

## Commit & Pull Request Guidelines

- Commit messages are written in Chinese using Conventional Commits-style prefixes: `feat:`, `fix:`, `refactor:`, `docs:` (e.g. `feat: 添加月度统计`); older history also uses `添加：/修改：/修复：` prefixes
- Develop on `dev`, merge to `main` via pull request; PRs to `main` trigger the Android build workflow
- Describe what and why in the PR, link related issues, and include screenshots for UI changes
