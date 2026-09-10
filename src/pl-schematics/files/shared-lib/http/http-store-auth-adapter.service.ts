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