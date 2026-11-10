import { TestBed } from '@angular/core/testing';
<% if (standalone) { %>
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { <%= rootComponentClass %> } from '<%= rootComponentImport %>';

describe('<%= rootComponentClass %>', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [<%= rootComponentClass %>],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(<%= rootComponentClass %>);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
<% } else { %>
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { <%= rootComponentClass %> } from '<%= rootComponentImport %>';

describe('<%= rootComponentClass %>', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [<%= rootComponentClass %>],
      providers: [provideRouter([]), provideHttpClient()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(<%= rootComponentClass %>);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
<% } %>
