import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryNavbar } from './category-navbar';

describe('CategoryNavbar', () => {
  let component: CategoryNavbar;
  let fixture: ComponentFixture<CategoryNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
