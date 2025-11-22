package com.aiaca.api.service.billing;

import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.billing.Charge;
import com.aiaca.api.model.billing.Dispute;
import com.aiaca.api.model.billing.enums.DisputeStatus;
import com.aiaca.api.repository.billing.ChargeRepository;
import com.aiaca.api.repository.billing.DisputeRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DisputeService {
    private final DisputeRepository disputeRepository;
    private final ChargeRepository chargeRepository;

    public DisputeService(DisputeRepository disputeRepository, ChargeRepository chargeRepository) {
        this.disputeRepository = disputeRepository;
        this.chargeRepository = chargeRepository;
    }

    public Page<Dispute> listDisputes(DisputeStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        if (status != null) {
            return disputeRepository.findByStatus(status, pageable);
        }
        return disputeRepository.findAll(pageable);
    }

    public Dispute getDispute(UUID id) {
        return disputeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
    }

    @Transactional
    public Dispute createDispute(UUID chargeId, DisputeStatus status, Long amount, String currency, String reason) {
        Charge charge = chargeRepository.findById(chargeId)
                .orElseThrow(() -> new ResourceNotFoundException("Charge not found"));
        Dispute dispute = new Dispute();
        dispute.setCharge(charge);
        dispute.setStatus(status != null ? status : DisputeStatus.UNDER_REVIEW);
        dispute.setAmount(amount);
        dispute.setCurrency(currency);
        dispute.setReason(reason);
        return disputeRepository.save(dispute);
    }

    @Transactional
    public Dispute updateStatus(UUID disputeId, DisputeStatus status) {
        Dispute dispute = getDispute(disputeId);
        dispute.setStatus(status);
        return disputeRepository.save(dispute);
    }
}
