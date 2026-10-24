import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CardSummary } from "./card-summary";

describe("CardSummary", () => {
  let component: CardSummary;
  let fixture: ComponentFixture<CardSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(CardSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
