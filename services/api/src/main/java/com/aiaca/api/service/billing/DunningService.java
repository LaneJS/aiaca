package com.aiaca.api.service.billing;

import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.DunningEvent;
import com.aiaca.api.model.billing.DunningSchedule;
import com.aiaca.api.model.billing.Invoice;
import com.aiaca.api.model.billing.enums.DunningEventStatus;
import com.aiaca.api.model.billing.enums.InvoiceStatus;
import com.aiaca.api.repository.billing.AccountRepository;
import com.aiaca.api.repository.billing.DunningEventRepository;
import com.aiaca.api.repository.billing.DunningScheduleRepository;
import com.aiaca.api.repository.billing.InvoiceRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DunningService {

    private final DunningEventRepository dunningEventRepository;
    private final DunningScheduleRepository dunningScheduleRepository;
    private final AccountRepository accountRepository;
    private final InvoiceRepository invoiceRepository;

    public DunningService(DunningEventRepository dunningEventRepository,
                          DunningScheduleRepository dunningScheduleRepository,
                          AccountRepository accountRepository,
                          InvoiceRepository invoiceRepository) {
        this.dunningEventRepository = dunningEventRepository;
        this.dunningScheduleRepository = dunningScheduleRepository;
        this.accountRepository = accountRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public List<DunningEvent> listEvents() {
        return dunningEventRepository.findAll();
    }

    public List<DunningSchedule> listSchedules() {
        return dunningScheduleRepository.findAll();
    }

    public java.util.List<Invoice> listPastDueInvoices() {
        return invoiceRepository.findByStatusAndDueDateBefore(InvoiceStatus.PAST_DUE, LocalDateTime.now(), org.springframework.data.domain.PageRequest.of(0, 200)).getContent();
    }

    @Transactional
    public DunningEvent recordEvent(UUID accountId, UUID invoiceId, UUID scheduleId, String stepName, String channel, DunningEventStatus status, String errorMessage) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Invoice invoice = null;
        if (invoiceId != null) {
            invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        }
        DunningSchedule schedule = null;
        if (scheduleId != null) {
            schedule = dunningScheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Dunning schedule not found"));
        }
        DunningEvent event = new DunningEvent();
        event.setAccount(account);
        event.setInvoice(invoice);
        event.setSchedule(schedule);
        event.setStepName(stepName);
        event.setChannel(channel);
        event.setStatus(status);
        event.setOccurredAt(LocalDateTime.now());
        event.setErrorMessage(errorMessage);
        return dunningEventRepository.save(event);
    }
}
