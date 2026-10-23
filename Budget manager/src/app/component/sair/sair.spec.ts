import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sair } from './sair';

describe('Sair', () => {
  let component: Sair;
  let fixture: ComponentFixture<Sair>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sair],
    }).compileComponents();

    fixture = TestBed.createComponent(Sair);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
