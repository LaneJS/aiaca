import {
  AuthResponse,
  EmbedConfigDto,
  PublicScanResponse,
  ScanDetail,
  SiteResponse,
} from './domain';

describe('domain DTOs', () => {
  it('should expose DTO shape placeholders for compilation', () => {
    const sampleAuth: AuthResponse = { userId: '1', email: 'a@b.com', token: 'token' };
    const sampleSite: SiteResponse = { id: '1', name: 'Site', url: 'https://example.com', embedKey: 'key', createdAt: new Date().toISOString() };
    const sampleScan: ScanDetail = {
      id: 'scan',
      siteId: 'site',
      createdAt: new Date().toISOString(),
      status: 'COMPLETED',
      score: 90,
      issues: [],
    };
    const samplePublic: PublicScanResponse = { url: 'https://example.com', score: 80, issues: [] };
    const embed: EmbedConfigDto = { siteId: 'site', embedKey: 'key', autoFixes: ['alt_text'], enableSkipLink: true };

    expect(sampleAuth.email).toBe('a@b.com');
    expect(sampleSite.name).toContain('Site');
    expect(sampleScan.status).toBe('COMPLETED');
    expect(samplePublic.issues).toHaveLength(0);
    expect(embed.autoFixes).toContain('alt_text');
  });
});
