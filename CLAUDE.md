# saucedemo-tests

Projekt za učenje Playwrighta: E2E testovi za https://www.saucedemo.com.

## Kako raditi sa mnom
- Komunikacija na hrvatskom; kod i komentari u kodu na engleskom.
- Učim, pa objašnjavaj *zašto*, ne samo *što*. Novi koncept uvedi na malom primjeru prije nego ga primijeniš svugdje.
- Komentari u testovima su namjerno opširni (objašnjavaju svaki korak) — zadrži taj stil.

## Stack
- Playwright Test 1.63 + TypeScript, Node, Windows / PowerShell
- `baseURL` = https://www.saucedemo.com (u `playwright.config.ts`), pa `page.goto('/')`
- Projekti: chromium, firefox, webkit
- CI: GitHub Actions (`.github/workflows/playwright.yml`)

## Naredbe
- Svi testovi: `npx playwright test`
- Jedan preglednik: `npx playwright test --project=chromium`
- UI mod: `npx playwright test --ui`
- Izvještaj: `npx playwright show-report`
- Codegen: `npx playwright codegen https://www.saucedemo.com`

## Struktura
- `tests/` — spec datoteke (`*.spec.ts`)
- `tests/login.spec.ts` — uspješan login, krivi password

## Konvencije
- Locatori po prioritetu: `getByRole` > `getByPlaceholder`/`getByLabel` > `[data-test="..."]` (saucedemo ga ima posvuda). Izbjegavati CSS klase i XPath.
- Bez `waitForTimeout` — oslanjati se na auto-waiting i web-first `expect`.
- Svaki test neovisan; zajednički setup u `beforeEach`.

## Testni korisnici (saucedemo, javni)
Password za sve: `secret_sauce`
- `standard_user` — normalan
- `locked_out_user` — zaključan
- `problem_user` — pokvarene slike/forme
- `performance_glitch_user` — spor
- `error_user`, `visual_user`

## Gdje sam stao
- [x] Osnove: locatori, assertions, `describe`/`beforeEach`
- [x] Login testovi
- [ ] Inventory: sortiranje, dodavanje u košaricu
- [ ] Checkout flow
- [ ] Page Object Model
- [ ] Fixtures + `storageState` (login samo jednom)
- [ ] API testiranje
- [ ] CI pokrenut na GitHubu
