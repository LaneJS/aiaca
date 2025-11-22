package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.PaymentMethod;
import com.aiaca.api.model.billing.enums.PaymentMethodStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {
    List<PaymentMethod> findByAccountId(UUID accountId);
    List<PaymentMethod> findByAccountIdAndStatus(UUID accountId, PaymentMethodStatus status);
}

