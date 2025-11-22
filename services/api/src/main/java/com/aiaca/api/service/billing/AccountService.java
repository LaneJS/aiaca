package com.aiaca.api.service.billing;

import com.aiaca.api.dto.billing.BillingDtos.*;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.User;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.Contact;
import com.aiaca.api.model.billing.PaymentMethod;
import com.aiaca.api.model.billing.enums.AccountStatus;
import com.aiaca.api.model.billing.enums.PaymentMethodStatus;
import com.aiaca.api.repository.billing.AccountRepository;
import com.aiaca.api.repository.billing.ContactRepository;
import com.aiaca.api.repository.billing.PaymentMethodRepository;
import com.aiaca.api.util.JsonHelper;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final ContactRepository contactRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final JsonHelper jsonHelper;

    public AccountService(AccountRepository accountRepository,
                          ContactRepository contactRepository,
                          PaymentMethodRepository paymentMethodRepository,
                          JsonHelper jsonHelper) {
        this.accountRepository = accountRepository;
        this.contactRepository = contactRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.jsonHelper = jsonHelper;
    }

    public Page<Account> listAccounts(AccountStatus status, String currency, String search, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        if (status != null) {
            return accountRepository.findByStatus(status, pageable);
        }
        if (StringUtils.hasText(currency)) {
            return accountRepository.findByCurrency(currency, pageable);
        }
        if (StringUtils.hasText(search)) {
            return accountRepository.findByNameContainingIgnoreCase(search, pageable);
        }
        return accountRepository.findAll(pageable);
    }

    public Account getAccount(UUID id) {
        return accountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Transactional
    public Account createAccount(User owner, CreateAccountRequest request) {
        Account account = new Account();
        account.setOwner(owner);
        account.setName(request.name());
        account.setStatus(AccountStatus.ACTIVE);
        account.setCurrency(request.currency());
        account.setStripeCustomerId(request.stripeCustomerId());
        account.setPrimaryContactEmail(request.primaryContactEmail());
        account.setTaxId(request.taxId());
        account.setTaxExempt(request.taxExempt());
        account.setBillingAddress(jsonHelper.toJson(request.billingAddress()));
        account.setMetadata(jsonHelper.toJson(request.metadata()));
        return accountRepository.save(account);
    }

    @Transactional
    public Account updateAccount(UUID accountId, UpdateAccountRequest request) {
        Account account = getAccount(accountId);
        if (StringUtils.hasText(request.name())) {
            account.setName(request.name());
        }
        if (request.status() != null) {
            account.setStatus(request.status());
        }
        if (StringUtils.hasText(request.currency())) {
            account.setCurrency(request.currency());
        }
        if (StringUtils.hasText(request.primaryContactEmail())) {
            account.setPrimaryContactEmail(request.primaryContactEmail());
        }
        if (request.taxId() != null) {
            account.setTaxId(request.taxId());
        }
        if (request.taxExempt() != null) {
            account.setTaxExempt(request.taxExempt());
        }
        if (request.billingAddress() != null) {
            account.setBillingAddress(jsonHelper.toJson(request.billingAddress()));
        }
        if (request.metadata() != null) {
            account.setMetadata(jsonHelper.toJson(request.metadata()));
        }
        return accountRepository.save(account);
    }

    @Transactional
    public Contact addContact(UUID accountId, ContactRequest request) {
        Account account = getAccount(accountId);
        if (request.primary()) {
            contactRepository.findByAccountId(accountId).stream()
                    .filter(Contact::isPrimary)
                    .forEach(existing -> {
                        existing.setPrimary(false);
                        contactRepository.save(existing);
                    });
        }
        Contact contact = new Contact();
        contact.setAccount(account);
        contact.setName(request.name());
        contact.setEmail(request.email());
        contact.setPhone(request.phone());
        contact.setRole(request.role());
        contact.setPrimary(request.primary());
        return contactRepository.save(contact);
    }

    @Transactional
    public Contact updateContact(UUID accountId, UUID contactId, ContactRequest request) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        if (!contact.getAccount().getId().equals(accountId)) {
            throw new BadRequestException("Contact does not belong to account");
        }
        if (request.primary()) {
            contactRepository.findByAccountId(accountId).stream()
                    .filter(Contact::isPrimary)
                    .forEach(existing -> {
                        existing.setPrimary(false);
                        contactRepository.save(existing);
                    });
        }
        contact.setName(request.name());
        contact.setEmail(request.email());
        contact.setPhone(request.phone());
        contact.setRole(request.role());
        contact.setPrimary(request.primary());
        return contactRepository.save(contact);
    }

    @Transactional
    public void deleteContact(UUID accountId, UUID contactId) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        if (!contact.getAccount().getId().equals(accountId)) {
            throw new BadRequestException("Contact does not belong to account");
        }
        contactRepository.delete(contact);
    }

    @Transactional
    public PaymentMethod addPaymentMethod(UUID accountId, PaymentMethodRequest request) {
        Account account = getAccount(accountId);
        if (request.defaultMethod()) {
            clearDefaultPaymentMethod(accountId);
        }
        PaymentMethod method = new PaymentMethod();
        method.setAccount(account);
        method.setType(request.type());
        method.setStatus(request.status() != null ? request.status() : PaymentMethodStatus.ACTIVE);
        method.setBrand(request.brand());
        method.setLast4(request.last4());
        method.setExpMonth(request.expMonth());
        method.setExpYear(request.expYear());
        method.setStripePaymentMethodId(request.stripePaymentMethodId());
        method.setBillingName(request.billingName());
        method.setDefaultMethod(request.defaultMethod());
        return paymentMethodRepository.save(method);
    }

    @Transactional
    public PaymentMethod updatePaymentMethod(UUID accountId, UUID paymentMethodId, PaymentMethodRequest request) {
        PaymentMethod method = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment method not found"));
        if (!method.getAccount().getId().equals(accountId)) {
            throw new BadRequestException("Payment method does not belong to account");
        }
        if (request.defaultMethod()) {
            clearDefaultPaymentMethod(accountId);
        }
        if (request.status() != null) {
            method.setStatus(request.status());
        }
        method.setBrand(request.brand());
        method.setLast4(request.last4());
        method.setExpMonth(request.expMonth());
        method.setExpYear(request.expYear());
        method.setStripePaymentMethodId(request.stripePaymentMethodId());
        method.setBillingName(request.billingName());
        method.setDefaultMethod(request.defaultMethod());
        return paymentMethodRepository.save(method);
    }

    @Transactional
    public void deletePaymentMethod(UUID accountId, UUID paymentMethodId) {
        PaymentMethod method = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment method not found"));
        if (!method.getAccount().getId().equals(accountId)) {
            throw new BadRequestException("Payment method does not belong to account");
        }
        paymentMethodRepository.delete(method);
    }

    public List<Contact> getContacts(UUID accountId) {
        return contactRepository.findByAccountId(accountId);
    }

    public List<PaymentMethod> getPaymentMethods(UUID accountId) {
        return paymentMethodRepository.findByAccountId(accountId);
    }

    private void clearDefaultPaymentMethod(UUID accountId) {
        paymentMethodRepository.findByAccountIdAndStatus(accountId, PaymentMethodStatus.ACTIVE)
                .forEach(pm -> {
                    if (pm.isDefaultMethod()) {
                        pm.setDefaultMethod(false);
                        paymentMethodRepository.save(pm);
                    }
                });
    }
}
