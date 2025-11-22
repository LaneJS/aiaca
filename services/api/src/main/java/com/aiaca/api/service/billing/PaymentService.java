package com.aiaca.api.service.billing;

import com.aiaca.api.dto.billing.BillingDtos.CreateChargeRequest;
import com.aiaca.api.dto.billing.BillingDtos.CreateCreditNoteRequest;
import com.aiaca.api.dto.billing.BillingDtos.CreateRefundRequest;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.Charge;
import com.aiaca.api.model.billing.CreditNote;
import com.aiaca.api.model.billing.Invoice;
import com.aiaca.api.model.billing.PaymentMethod;
import com.aiaca.api.model.billing.Refund;
import com.aiaca.api.model.billing.enums.ChargeStatus;
import com.aiaca.api.model.billing.enums.CreditNoteStatus;
import com.aiaca.api.model.billing.enums.PaymentMethodStatus;
import com.aiaca.api.model.billing.enums.RefundStatus;
import com.aiaca.api.repository.billing.AccountRepository;
import com.aiaca.api.repository.billing.ChargeRepository;
import com.aiaca.api.repository.billing.CreditNoteRepository;
import com.aiaca.api.repository.billing.InvoiceRepository;
import com.aiaca.api.repository.billing.PaymentMethodRepository;
import com.aiaca.api.repository.billing.RefundRepository;
import com.aiaca.api.util.JsonHelper;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final ChargeRepository chargeRepository;
    private final RefundRepository refundRepository;
    private final CreditNoteRepository creditNoteRepository;
    private final AccountRepository accountRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final JsonHelper jsonHelper;

    public PaymentService(ChargeRepository chargeRepository,
                          RefundRepository refundRepository,
                          CreditNoteRepository creditNoteRepository,
                          AccountRepository accountRepository,
                          InvoiceRepository invoiceRepository,
                          PaymentMethodRepository paymentMethodRepository,
                          JsonHelper jsonHelper) {
        this.chargeRepository = chargeRepository;
        this.refundRepository = refundRepository;
        this.creditNoteRepository = creditNoteRepository;
        this.accountRepository = accountRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.jsonHelper = jsonHelper;
    }

    public Page<Charge> listCharges(UUID accountId, ChargeStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        if (accountId != null) {
            return chargeRepository.findByAccountId(accountId, pageable);
        }
        if (status != null) {
            return chargeRepository.findByStatus(status, pageable);
        }
        return chargeRepository.findAll(pageable);
    }

    public Charge getCharge(UUID chargeId) {
        return chargeRepository.findById(chargeId).orElseThrow(() -> new ResourceNotFoundException("Charge not found"));
    }

    @Transactional
    public Charge createCharge(CreateChargeRequest request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Invoice invoice = null;
        if (request.invoiceId() != null) {
            invoice = invoiceRepository.findById(request.invoiceId())
                    .orElseThrow(() -> new BadRequestException("Invoice not found"));
        }
        PaymentMethod paymentMethod = null;
        if (request.paymentMethodId() != null) {
            paymentMethod = paymentMethodRepository.findById(request.paymentMethodId())
                    .orElseThrow(() -> new BadRequestException("Payment method not found"));
            if (paymentMethod.getStatus() == PaymentMethodStatus.REVOKED) {
                throw new BadRequestException("Payment method revoked");
            }
        }
        Charge charge = new Charge();
        charge.setAccount(account);
        charge.setInvoice(invoice);
        charge.setPaymentMethod(paymentMethod);
        charge.setStatus(ChargeStatus.PENDING);
        charge.setAmount(request.amount());
        charge.setCurrency(request.currency());
        charge.setAuthorizedAt(LocalDateTime.now());
        charge.setMetadata(jsonHelper.toJson(request.metadata()));
        return chargeRepository.save(charge);
    }

    @Transactional
    public Charge markChargeStatus(UUID chargeId, ChargeStatus status, String failureCode, String failureMessage) {
        Charge charge = getCharge(chargeId);
        charge.setStatus(status);
        charge.setFailureCode(failureCode);
        charge.setFailureMessage(failureMessage);
        if (status == ChargeStatus.SUCCEEDED) {
            charge.setCapturedAt(LocalDateTime.now());
        }
        return chargeRepository.save(charge);
    }

    @Transactional
    public Refund createRefund(UUID chargeId, CreateRefundRequest request) {
        Charge charge = getCharge(chargeId);
        Refund refund = new Refund();
        refund.setCharge(charge);
        refund.setStatus(RefundStatus.PENDING);
        refund.setAmount(request.amount());
        refund.setCurrency(charge.getCurrency());
        refund.setReason(request.reason());
        refund.setRefundedAt(LocalDateTime.now());
        Refund saved = refundRepository.save(refund);
        charge.setRefundedAmount((charge.getRefundedAmount() == null ? 0 : charge.getRefundedAmount()) + request.amount());
        chargeRepository.save(charge);
        return saved;
    }

    @Transactional
    public CreditNote createCreditNote(UUID invoiceId, CreateCreditNoteRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new BadRequestException("Invoice not found"));
        CreditNote creditNote = new CreditNote();
        creditNote.setInvoice(invoice);
        creditNote.setStatus(CreditNoteStatus.ISSUED);
        creditNote.setAmount(request.amount());
        creditNote.setCurrency(invoice.getCurrency());
        creditNote.setReason(request.reason());
        creditNote.setMetadata(jsonHelper.toJson(request.metadata()));
        return creditNoteRepository.save(creditNote);
    }
}
