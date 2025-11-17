import {
  apiKeySchema,
  validateSite,
  ScanStatus,
  IssueSeverity,
  IssueStatus,
  AuthResponse,
  EmbedConfigDto,
  PublicScanResponse,
  ScanDetail,
  SiteResponse,
} from './domain';
import { sanitizeScanUrl } from './url-validator';

describe('domain validation helpers', () => {
  it('validates a site payload', () => {
    const payload = {
      id: '11111111-1111-1111-1111-111111111111',
      userId: '22222222-2222-2222-2222-222222222222',
      name: 'Test Site',
      baseUrl: 'https://example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(validateSite(payload)).toEqual(payload);
  });

  it('enforces enum values', () => {
    const apiKey = apiKeySchema.parse({
      id: '33333333-3333-3333-3333-333333333333',
      userId: '22222222-2222-2222-2222-222222222222',
      keyType: 'SERVICE',
      keyValue: 'dev-key-1',
      createdAt: new Date().toISOString(),
    });

    expect(apiKey.keyType).toBe('SERVICE');
    expect(ScanStatus.COMPLETED).toBe('COMPLETED');
    expect(IssueSeverity.SERIOUS).toBe('SERIOUS');
    expect(IssueStatus.OPEN).toBe('OPEN');
  });
});

describe('sanitizeScanUrl', () => {
  it('normalizes and strips fragments', () => {
    const result = sanitizeScanUrl(' https://Example.com/path#section ');

    expect(result).toBe('https://example.com/path');
  });

  it('rejects unsupported protocols', () => {
    expect(() => sanitizeScanUrl('ftp://example.com')).toThrow('http or https');
  });
});

describe('domain DTOs', () => {
  it('should expose DTO shape placeholders for compilation', () => {
    const sampleAuth: AuthResponse = { userId: '1', email: 'a@b.com', token: 'token' };
    const sampleSite: SiteResponse = {
      id: '1',
      name: 'Site',
      url: 'https://example.com',
      embedKey: 'key',
      createdAt: new Date().toISOString(),
    };
    const sampleScan: ScanDetail = {
      id: 'scan',
      siteId: 'site',
      createdAt: new Date().toISOString(),
      status: ScanStatus.COMPLETED,
      score: 90,
      issues: [],
    };
    const samplePublic: PublicScanResponse = { url: 'https://example.com', score: 80, issues: [] };
    const embed: EmbedConfigDto = { siteId: 'site', embedKey: 'key', autoFixes: ['alt_text'], enableSkipLink: true };

    expect(sampleAuth.email).toBe('a@b.com');
    expect(sampleSite.name).toContain('Site');
    expect(sampleScan.status).toBe(ScanStatus.COMPLETED);
    expect(samplePublic.issues).toHaveLength(0);
    expect(embed.autoFixes).toContain('alt_text');
  });
});
