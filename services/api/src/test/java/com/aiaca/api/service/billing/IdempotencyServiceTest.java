package com.aiaca.api.service.billing;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;

import com.aiaca.api.exception.ConflictException;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.enums.AccountStatus;
import com.aiaca.api.repository.billing.AccountRepository;
import com.aiaca.api.repository.billing.IdempotencyRequestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(IdempotencyService.class)
class IdempotencyServiceTest {

    @Autowired
    private IdempotencyService idempotencyService;

    @Autowired
    private IdempotencyRequestRepository idempotencyRequestRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Test
    void assertOrRecord_allowsFirstUse_blocksDuplicatePerAccount() {
        Account account = new Account();
        account.setName("Acme");
        account.setCurrency("USD");
        account.setStatus(AccountStatus.ACTIVE);
        account = accountRepository.save(account);
        final Account savedAccount = account;

        idempotencyService.assertOrRecord(savedAccount, "key-1", "hash", "req-1", "ACCOUNT", savedAccount.getId().toString());

        assertThat(idempotencyRequestRepository.findByAccountIdAndIdempotencyKey(savedAccount.getId(), "key-1")).isPresent();
        assertThatThrownBy(() ->
                idempotencyService.assertOrRecord(savedAccount, "key-1", "hash", "req-1", "ACCOUNT", savedAccount.getId().toString()))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void assertOrRecord_allowsGlobalKeyWhenNoAccount() {
        idempotencyService.assertOrRecord(null, "global-key", null, "req-2", "GLOBAL", null);
        assertThat(idempotencyRequestRepository.findByIdempotencyKey("global-key")).isPresent();
    }
}
