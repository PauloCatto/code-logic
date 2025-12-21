import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Blockly } from './blockly';

describe('Blockly', () => {
  let component: Blockly;
  let fixture: ComponentFixture<Blockly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Blockly]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Blockly);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
