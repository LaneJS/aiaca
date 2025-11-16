import { apiKeySchema, validateSite, ScanStatus, IssueSeverity, IssueStatus } from './domain';

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
