package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.*;
import com.aiaca.api.model.User;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.Contact;
import com.aiaca.api.model.billing.PaymentMethod;
import com.aiaca.api.model.billing.enums.AccountStatus;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.billing.AccountService;
import com.aiaca.api.service.billing.AuditLogService;
import com.aiaca.api.service.billing.BillingMapper;
import com.aiaca.api.service.billing.IdempotencyService;
import com.aiaca.api.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/accounts")
public class BillingAccountController {

    private final AccountService accountService;
    private final BillingMapper billingMapper;
    private final IdempotencyService idempotencyService;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public BillingAccountController(AccountService accountService,
                                    BillingMapper billingMapper,
                                    IdempotencyService idempotencyService,
                                    UserRepository userRepository,
                                    AuditLogService auditLogService) {
        this.accountService = accountService;
        this.billingMapper = billingMapper;
        this.idempotencyService = idempotencyService;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public PageResponse<AccountResponse> listAccounts(
            @RequestParam(name = "status", required = false) AccountStatus status,
            @RequestParam(name = "currency", required = false) String currency,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        Page<Account> results = accountService.listAccounts(status, currency, search, page, pageSize);
        List<AccountResponse> items = results.getContent().stream().map(billingMapper::toAccountResponse).toList();
        return new PageResponse<>(items, results.getTotalElements(), results.getNumber(), results.getSize());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<AccountResponse> createAccount(@AuthenticationPrincipal UserPrincipal principal,
                                                         @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                         @Valid @RequestBody CreateAccountRequest request) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "ACCOUNT", null);
        Account account = accountService.createAccount(owner, request);
        auditLogService.record(account.getId(), principal.getId(), principal.getEmail(), "ACCOUNT_CREATED", "ACCOUNT", account.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toAccountResponse(account));
    }

    @GetMapping("/{accountId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable UUID accountId) {
        Account account = accountService.getAccount(accountId);
        return ResponseEntity.ok(billingMapper.toAccountResponse(account));
    }

    @PatchMapping("/{accountId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable UUID accountId,
                                                         @AuthenticationPrincipal UserPrincipal principal,
                                                         @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                         @Valid @RequestBody UpdateAccountRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "ACCOUNT", accountId.toString());
        Account account = accountService.updateAccount(accountId, request);
        auditLogService.record(account.getId(), principal.getId(), principal.getEmail(), "ACCOUNT_UPDATED", "ACCOUNT", account.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toAccountResponse(account));
    }

    @GetMapping("/{accountId}/contacts")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public List<ContactResponse> listContacts(@PathVariable UUID accountId) {
        return accountService.getContacts(accountId).stream().map(billingMapper::toContactResponse).toList();
    }

    @PostMapping("/{accountId}/contacts")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ContactResponse> addContact(@PathVariable UUID accountId,
                                                      @AuthenticationPrincipal UserPrincipal principal,
                                                      @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                      @Valid @RequestBody ContactRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "CONTACT", accountId.toString());
        Contact contact = accountService.addContact(accountId, request);
        auditLogService.record(accountId, principal.getId(), principal.getEmail(), "CONTACT_CREATED", "CONTACT", contact.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toContactResponse(contact));
    }

    @PatchMapping("/{accountId}/contacts/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ContactResponse> updateContact(@PathVariable UUID accountId,
                                                         @AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable UUID contactId,
                                                         @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                         @Valid @RequestBody ContactRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "CONTACT", contactId.toString());
        Contact contact = accountService.updateContact(accountId, contactId, request);
        auditLogService.record(accountId, principal.getId(), principal.getEmail(), "CONTACT_UPDATED", "CONTACT", contact.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toContactResponse(contact));
    }

    @DeleteMapping("/{accountId}/contacts/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<Void> deleteContact(@PathVariable UUID accountId,
                                              @AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable UUID contactId,
                                              @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "CONTACT", contactId.toString());
        accountService.deleteContact(accountId, contactId);
        auditLogService.record(accountId, principal.getId(), principal.getEmail(), "CONTACT_DELETED", "CONTACT", contactId.toString(), null, null);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{accountId}/payment-methods")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public List<PaymentMethodResponse> listPaymentMethods(@PathVariable UUID accountId) {
        return accountService.getPaymentMethods(accountId).stream().map(billingMapper::toPaymentMethodResponse).toList();
    }

    @PostMapping("/{accountId}/payment-methods")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<PaymentMethodResponse> addPaymentMethod(@PathVariable UUID accountId,
                                                                  @AuthenticationPrincipal UserPrincipal principal,
                                                                  @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                                  @Valid @RequestBody PaymentMethodRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "PAYMENT_METHOD", accountId.toString());
        PaymentMethod method = accountService.addPaymentMethod(accountId, request);
        auditLogService.record(accountId, principal.getId(), principal.getEmail(), "PAYMENT_METHOD_ADDED", "PAYMENT_METHOD", method.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toPaymentMethodResponse(method));
    }

    @PatchMapping("/{accountId}/payment-methods/{paymentMethodId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<PaymentMethodResponse> updatePaymentMethod(@PathVariable UUID accountId,
                                                                     @AuthenticationPrincipal UserPrincipal principal,
                                                                     @PathVariable UUID paymentMethodId,
                                                                     @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                                     @Valid @RequestBody PaymentMethodRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "PAYMENT_METHOD", paymentMethodId.toString());
        PaymentMethod method = accountService.updatePaymentMethod(accountId, paymentMethodId, request);
        auditLogService.record(accountId, principal.getId(), principal.getEmail(), "PAYMENT_METHOD_UPDATED", "PAYMENT_METHOD", method.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toPaymentMethodResponse(method));
    }

    @DeleteMapping("/{accountId}/payment-methods/{paymentMethodId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable UUID accountId,
                                                    @AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable UUID paymentMethodId,
                                                    @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "PAYMENT_METHOD", paymentMethodId.toString());
        accountService.deletePaymentMethod(accountId, paymentMethodId);
        auditLogService.record(accountId, principal.getId(), principal.getEmail(), "PAYMENT_METHOD_DELETED", "PAYMENT_METHOD", paymentMethodId.toString(), null, null);
        return ResponseEntity.noContent().build();
    }
}
