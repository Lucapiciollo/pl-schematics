// Esempio (commentato) di adapter di autenticazione basato su NgRx Store: legge e salva il token nello store,
// rinnova il token tramite il servizio API di autenticazione ed esegue il logout svuotando lo storage.
// @Injectable({
//   providedIn: 'root',
// })
// export class StoreAuthAdapterService implements HttpAuthAdapter {
//   constructor(
//     private readonly store: Store,
//     private readonly authApi: AuthApiService,
//   ) {}

//   getAccessToken(): string | null {
//     let token: string | null = null;

//     this.store
//       .select(selectStorageToken)
//       .pipe(take(1))
//       .subscribe((value) => token = value);

//     return token;
//   }

//   setAccessToken(token: string): void {
//     this.store.dispatch(storageSetToken({ token }));
//   }

//   refreshToken(): Observable<HttpRefreshTokenResponse> {
//     return this.authApi.refreshToken();
//   }

//   logout(): void {
//     this.store.dispatch(storageClear());
//   }
// }