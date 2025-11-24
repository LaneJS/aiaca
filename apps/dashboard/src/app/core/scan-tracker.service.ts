import { Injectable, inject } from '@angular/core';
import { timer } from 'rxjs';
import { startWith, switchMap, takeWhile } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ScanSummary } from './models';

@Injectable({ providedIn: 'root' })
export class ScanTrackerService {
  private readonly api = inject(ApiService);
  private readonly pollIntervalMs = 3000;

  triggerAndWatch(siteId: string, pageUrl: string) {
    return this.api.triggerScan(siteId, pageUrl).pipe(
      switchMap((scan) => this.watchScan(scan.id).pipe(startWith(scan)))
    );
  }

  watchScan(scanId: string) {
    return timer(0, this.pollIntervalMs).pipe(
      switchMap(() => this.api.getScanStatus(scanId)),
      takeWhile((scan) => !this.isTerminal(scan), true)
    );
  }

  private isTerminal(scan: ScanSummary): boolean {
    return scan.status === 'completed' || scan.status === 'failed';
  }
}
