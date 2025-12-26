package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.enums.AccountStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    Page<Account> findByStatus(AccountStatus status, Pageable pageable);
    Page<Account> findByCurrency(String currency, Pageable pageable);
    Page<Account> findByNameContainingIgnoreCase(String search, Pageable pageable);
    Optional<Account> findByStripeCustomerId(String stripeCustomerId);
}
