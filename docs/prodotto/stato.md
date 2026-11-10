# Stato iniziativa: pl-schematics compat Angular 19-21
- Repo: C:\Users\LucaPiciollo\Luca\pl-schematics, branch fix/angular-compat (da origin/main e1cdc3f)
- TimeVision: NON modificare. Nessun commit/push/publish senza richiesta esplicita.
- Diagnosi: elenco A.1-A.8, B.1-B.10 (sessione orchestratore).
- Ipotesi: versione target 4.0.0; Angular 19 minimo, matrice 19/20/21; standalone supportato; organizzazione rules/files invariata.

## Audit 2026-11-10
- Verificato: build OK, npm test 31 specs 0 failures (branch fix/angular-compat, 119 file non committati sopra e1cdc3f).
- Matrice e2e (42 righe) mai eseguita su questa macchina: avviata riga ng19 full classic+standalone, log in %TEMP%\e2e-ng19-full.log (in corso).
- Aperto: http-store-auth-adapter.service.ts interamente commentato; Node 24.13.1 locale potrebbe non bastare per Angular CLI 21.

## 2026-11-10 14:15 - decisione utente: commit del lavoro v4.0.0 su fix/angular-compat (nessun push/publish)
- Run e2e runF (42 righe, in corso in background, work dir %TEMP%\opencode\plmx\w): ng build PASS ovunque; ng test FAIL su 6 righe ng21-classic (home.component.spec: pipe 'translate' non trovata con vitest/AOT). Fix applicato al template (spec classic usa imports:[HomeModule]); verificato a mano su ng21-classic-base-strict (3/3 test OK). Da riverificare con la matrice completa.
- Aperto: runtime FAIL su ng19-classic-azure e ng19-standalone-azure (causa non ancora diagnosticata; il log del runtime non e' salvato, riprodurre con tools/e2e-runtime.js --azure a matrice ferma: porte 3001/4300 fisse).
- Aperto: http-store-auth-adapter.service.ts commentato.

## 2026-11-10 14:35
- Diagnosi azure runtime: msal-browser 5 non ha enableAccountStorageEvents (fix: chiamata opzionale). Check traduzione runtime: race (ora attende). Commit dedicato.
- Avviata matrice completa runG (42 righe, jobs 4), work dir %TEMP%\opencode\plmx\w2, log runG.log. Esito atteso: da verificare.

## 2026-11-10 17:55 - push richiesto dall'utente
- Merge ff docs/commenti (1891309) in fix/angular-compat: commenti JSDoc, fix InitializerModule.forRoot, loader pl-loading-trace al posto di ngx-ui-loader, dipendenze PL 'latest', canMatch/canActivateChild in RouteFakeGuard.
- Verifica sul codice finale: build + npm test 33/33; app classic/standalone con e senza Azure: ng build + ng test OK (log %TEMP%\opencode\v3 per standalone Azure).
- NON eseguita la matrice e2e completa sul codice finale (runG in corso = codice precedente al loader; porte 3001/4300 occupate). Da rilanciare prima di release/publish.
- Aperti: compodoc obsoleto (documentation/**), http-store-auth-adapter commentato, interceptor MSAL con http=interceptor-functional non provato a runtime.
