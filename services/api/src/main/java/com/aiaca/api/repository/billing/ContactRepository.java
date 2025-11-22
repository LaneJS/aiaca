package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Contact;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, UUID> {
    List<Contact> findByAccountId(UUID accountId);
}

