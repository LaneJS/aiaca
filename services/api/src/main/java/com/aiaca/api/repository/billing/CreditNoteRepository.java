package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.CreditNote;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditNoteRepository extends JpaRepository<CreditNote, UUID> {
}

