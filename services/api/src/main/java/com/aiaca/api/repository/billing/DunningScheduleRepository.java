package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.DunningSchedule;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DunningScheduleRepository extends JpaRepository<DunningSchedule, UUID> {
}

