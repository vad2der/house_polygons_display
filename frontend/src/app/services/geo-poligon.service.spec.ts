import { TestBed } from '@angular/core/testing';

import { GeoPoligonService } from './geo-poligon.service';

describe('GeoPoligonService', () => {
  let service: GeoPoligonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoPoligonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
