import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
<% if (i18n === 'ngx-translate') { %>import { provideTranslateService } from '@ngx-translate/core';
<% } %><% if (!standalone) { %>import { HomeModule } from './home.module';
<% } %>
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      <% if (standalone) { %>imports: [ HomeComponent ],<% } else { %>imports: [ HomeModule ],<% } %>
      providers: [
        provideRouter([]),
        provideHttpClient(),
        <% if (i18n === 'ngx-translate') { %>provideTranslateService({ lang: 'it', fallbackLang: 'it' }),<% } %>
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
