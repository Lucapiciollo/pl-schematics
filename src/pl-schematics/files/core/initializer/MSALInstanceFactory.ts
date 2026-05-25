import { IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { environment } from '@env/environment';
import loggerCallback from './LoggerCallback';

export default function MSALInstanceFactory(): IPublicClientApplication {
   return new PublicClientApplication({
      ...Object(environment.azure.param),
      system: {
         windowHashTimeout: 10000,
         iframeHashTimeout: 5000,
         loadFrameTimeout: 0,
         allowNativeBroker: false,
         loggerOptions: {
            loggerCallback,
            logLevel: LogLevel.Error,
            piiLoggingEnabled: false,
         },
      },
   });
}
