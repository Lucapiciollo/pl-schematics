/**
 * @author l.piciollo
 * Entry point pubblico della libreria "<%= sharedLibName %>".
 * Tutto cio' che deve essere importabile dall'applicazione (o da altre librerie
 * del workspace) deve essere ri-esportato qui.
 */

export * from './lib/module/shared.module';

export * from './lib/pipe/pipe.module';
export * from './lib/pipe/comma-decimal.pipe';
export * from './lib/pipe/convert.pipe';
export * from './lib/pipe/count-years.pipe';
export * from './lib/pipe/currency-format.pipe';
export * from './lib/pipe/decimal-fix.pipe';
export * from './lib/pipe/enum2desc.pipe';
export * from './lib/pipe/expired-date.pipe';
export * from './lib/pipe/first-char.pipe';
export * from './lib/pipe/localized-date.pipe';
export * from './lib/pipe/normalize.pipe';
export * from './lib/pipe/remove-leading-zeros.pipe';
export * from './lib/pipe/round-pipe';
export * from './lib/pipe/safe.pipe';
export * from './lib/pipe/sort.pipe';
export * from './lib/pipe/translate-async.pipe';
export * from './lib/pipe/truncate-name-file.pipe';
export * from './lib/pipe/truncate.pipe';

export * from './lib/utils/utils';
export * from './lib/utils/device-detector.constants';

export * from './lib/bean/error-bean';

export * from './lib/tokens/base-url-api.token';
export * from './lib/tokens/app-bootstrap-task.token';

<% if (logging === "advanced") { %>
export * from './lib/logging/logger.service';
export * from './lib/logging/logger-feature.enum';
export * from './lib/logging/logger-level.enum';
export * from './lib/logging/logger-config.interface';
export * from './lib/logging/logger-entry.interface';
export * from './lib/logging/logger-port.interface';
export * from './lib/logging/logger-console-logger.service';
export * from './lib/logging/logger-provider';
<% } %>

<% if (http === "interceptor-classic" || http === "interceptor-functional") { %>
export * from './lib/http/http-interceptor.tokens';
export * from './lib/http/http-interceptor.provider';
export * from './lib/http/local-storage-auth-adapter.service';
export * from './lib/interceptor/http-interceptor.service';
export * from './lib/interceptor/http-interceptor-fake.service';
<% } %>

<% if (ui === "material") { %>
export * from './lib/material/material.module';
<% } %>
