package com.aiaca.api.service.billing;

import com.aiaca.api.dto.billing.BillingDtos.CreateInvoiceRequest;
import com.aiaca.api.dto.billing.BillingDtos.InvoiceLineRequest;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.Coupon;
import com.aiaca.api.model.billing.Invoice;
import com.aiaca.api.model.billing.InvoiceLine;
import com.aiaca.api.model.billing.Price;
import com.aiaca.api.model.billing.Subscription;
import com.aiaca.api.model.billing.enums.InvoiceStatus;
import com.aiaca.api.repository.billing.AccountRepository;
import com.aiaca.api.repository.billing.CouponRepository;
import com.aiaca.api.repository.billing.InvoiceLineRepository;
import com.aiaca.api.repository.billing.InvoiceRepository;
import com.aiaca.api.repository.billing.PriceRepository;
import com.aiaca.api.repository.billing.SubscriptionRepository;
import com.aiaca.api.util.JsonHelper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineRepository invoiceLineRepository;
    private final AccountRepository accountRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CouponRepository couponRepository;
    private final PriceRepository priceRepository;
    private final JsonHelper jsonHelper;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          InvoiceLineRepository invoiceLineRepository,
                          AccountRepository accountRepository,
                          SubscriptionRepository subscriptionRepository,
                          CouponRepository couponRepository,
                          PriceRepository priceRepository,
                          JsonHelper jsonHelper) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceLineRepository = invoiceLineRepository;
        this.accountRepository = accountRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.couponRepository = couponRepository;
        this.priceRepository = priceRepository;
        this.jsonHelper = jsonHelper;
    }

    public Page<Invoice> listInvoices(UUID accountId, InvoiceStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        if (accountId != null) {
            return invoiceRepository.findByAccountId(accountId, pageable);
        }
        if (status != null) {
            return invoiceRepository.findByStatus(status, pageable);
        }
        return invoiceRepository.findAll(pageable);
    }

    public Invoice getInvoice(UUID id) {
        return invoiceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    public List<InvoiceLine> getLines(UUID invoiceId) {
        return invoiceLineRepository.findByInvoiceId(invoiceId);
    }

    @Transactional
    public Invoice createInvoice(CreateInvoiceRequest request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Invoice invoice = new Invoice();
        invoice.setAccount(account);
        if (request.subscriptionId() != null) {
            Subscription subscription = subscriptionRepository.findById(request.subscriptionId())
                    .orElseThrow(() -> new BadRequestException("Subscription not found"));
            invoice.setSubscription(subscription);
        }
        if (request.couponId() != null) {
            Coupon coupon = couponRepository.findById(request.couponId())
                    .orElseThrow(() -> new BadRequestException("Coupon not found"));
            invoice.setCoupon(coupon);
        }
        invoice.setStatus(InvoiceStatus.OPEN);
        invoice.setCurrency(request.currency());
        invoice.setCollectionMethod(request.collectionMethod());
        invoice.setDueDate(request.dueDate());
        invoice.setIssuedAt(LocalDateTime.now());
        invoice.setMetadata(jsonHelper.toJson(request.metadata()));
        Invoice saved = invoiceRepository.save(invoice);

        if (request.lines() != null) {
            for (InvoiceLineRequest lineRequest : request.lines()) {
                addInvoiceLine(saved, lineRequest);
            }
        }
        recalcTotals(saved);
        return invoiceRepository.save(saved);
    }

    private InvoiceLine addInvoiceLine(Invoice invoice, InvoiceLineRequest lineRequest) {
        InvoiceLine line = new InvoiceLine();
        line.setInvoice(invoice);
        if (lineRequest.priceId() != null) {
            Price price = priceRepository.findById(lineRequest.priceId())
                    .orElseThrow(() -> new BadRequestException("Price not found"));
            line.setPrice(price);
        }
        line.setDescription(lineRequest.description());
        line.setQuantity(lineRequest.quantity());
        line.setUnitAmount(lineRequest.unitAmount());
        line.setAmount(lineRequest.amount());
        line.setProration(lineRequest.proration());
        return invoiceLineRepository.save(line);
    }

    private void recalcTotals(Invoice invoice) {
        List<InvoiceLine> lines = getLines(invoice.getId());
        long subtotal = lines.stream().mapToLong(InvoiceLine::getAmount).sum();
        invoice.setSubtotal(subtotal);
        invoice.setTotal(subtotal);
        invoice.setAmountDue(subtotal);
        invoice.setAmountRemaining(subtotal);
        invoice.setAmountPaid(Optional.ofNullable(invoice.getAmountPaid()).orElse(0L));
    }
}
