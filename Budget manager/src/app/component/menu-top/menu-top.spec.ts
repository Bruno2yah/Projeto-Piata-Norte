import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MenuTop } from "./menu-top";

describe("MenuTop", () => {
  let component: MenuTop;
  let fixture: ComponentFixture<MenuTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTop],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuTop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
