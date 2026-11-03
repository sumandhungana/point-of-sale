//package com.puff.tech.inventorymanagement.usecase.salesbill.add;
//
//import com.puff.tech.core.usecases.MonoUC;
//import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
//import com.puff.tech.inventorymanagement.repository.ProductEntity;
//import com.puff.tech.inventorymanagement.repository.ProductRepository;
//import com.puff.tech.inventorymanagement.repository.SalesBillEntity;
//import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
//import com.puff.tech.onboarding.repository.MemberEntity;
//import com.puff.tech.security.UseCaseContext;
//import io.micronaut.transaction.annotation.Transactional;
//import jakarta.inject.Singleton;
//import reactor.core.publisher.Flux;
//import reactor.core.publisher.Mono;
//
//import java.util.List;
//
//@Singleton
//public class AddSalesBillUC implements MonoUC<AddSalesBillUCRequest, AddSalesBillUCResponse> {
//
//    private final SalesBillRepository salesBillRepository;
//    private final ProductRepository productRepository;
//
//    public AddSalesBillUC(SalesBillRepository salesBillRepository,
//                          ProductRepository productRepository) {
//        this.salesBillRepository = salesBillRepository;
//        this.productRepository = productRepository;
//    }
//
//
//    @Override
//    @Transactional
//    public Mono<AddSalesBillUCResponse> execute(AddSalesBillUCRequest request, UseCaseContext context) {
//        Long memberId = context.securityContext().memberId();
//        return validateRequest(request)
//                .then(salesBillRepository.acquireMemberLock(memberId))
//                .thenMany(processItemsStock(request.items(), memberId))
//                .collectList()
//                .flatMap(processedItems -> saveSalesBills(request, processedItems, context))
//                .map(this::buildResponse);
//    }
//
//    // --- Private Helper Methods ---
//
//    private Mono<Void> validateRequest(AddSalesBillUCRequest request) {
//        if (request == null || request.items() == null || request.items().isEmpty()) {
//            return Mono.error(new IllegalArgumentException("Sales bill must contain at least one item."));
//        }
//        return Mono.empty();
//    }
//
//    private Flux<AddSalesBillUCRequest.SalesBillItemRequest> processItemsStock(
//            List<AddSalesBillUCRequest.SalesBillItemRequest> items, Long memberId) {
//        return Flux.fromIterable(items)
//                .flatMap(item -> decrementAndVerifyStock(item, memberId));
//    }
//
//    private Mono<AddSalesBillUCRequest.SalesBillItemRequest> decrementAndVerifyStock(
//            AddSalesBillUCRequest.SalesBillItemRequest item, Long memberId) {
//        return productRepository.decrementStock(item.itemId(), memberId, item.quantity())
//                .flatMap(updatedRows -> {
//                    if (updatedRows == 0) {
//                        return Mono.error(new IllegalStateException(
//                                "Insufficient stock or item not found for ID: " + item.itemId()));
//                    }
//                    return Mono.just(item);
//                });
//    }
//
//    private Mono<List<SalesBillEntity>> saveSalesBills(
//            AddSalesBillUCRequest request,
//            List<AddSalesBillUCRequest.SalesBillItemRequest> items,
//            UseCaseContext context) {
//
//        List<SalesBillEntity> entities = items.stream()
//                .map(item -> createSalesBillEntity(request, item, context))
//                .toList();
//
//        return salesBillRepository.saveAll(entities).collectList();
//    }
//
//    private SalesBillEntity createSalesBillEntity(
//            AddSalesBillUCRequest request,
//            AddSalesBillUCRequest.SalesBillItemRequest item,
//            UseCaseContext context) {
//
//        SalesBillEntity entity = new SalesBillEntity();
//        entity.setBillNumber(request.billNumber());
//        entity.setBillDate(request.billDate());
//        entity.setPaymentMode(request.paymentMode());
//        entity.setPaymentStatus(request.paymentStatus());
//        entity.setRemarks(request.remarks());
//        entity.setPhotoPath(request.photoPath());
//
//        // Item level details
//        entity.setQuantity(item.quantity());
//        entity.setUnitPrice(item.unitPrice());
//        entity.setTaxPercentage(item.taxPercentage());
//        entity.setVatPercentage(item.vatPercentage());
//        entity.setTaxAmount(item.taxAmount());
//        entity.setVatAmount(item.vatAmount());
//        entity.setAmount(item.totalPrice());
//
//        // Customer binding logic (handles optional customer/walk-in customer)
//        if (request.customerId() != null && request.customerId() > 0) {
//            OrganizationCustomerEntity customer = new OrganizationCustomerEntity();
//            customer.setId(Math.toIntExact(request.customerId()));
//            entity.setCustomer(customer);
//            entity.setCustomerName(request.customerName());
//        } else {
//            entity.setCustomerName(
//                    request.customerName() != null && !request.customerName().isBlank()
//                            ? request.customerName()
//                            : "Walk-in Customer"
//            );
//        }
//
//        MemberEntity member = new MemberEntity();
//        member.setId(context.securityContext().memberId());
//        entity.setMember(member);
//
//        ProductEntity product = new ProductEntity();
//        product.setId(item.itemId());
//        entity.setProduct(product);
//
//        entity.setCreatedBy(context.securityContext().subject());
//        entity.setUpdatedBy(context.securityContext().subject());
//
//        return entity;
//    }
//
//    private AddSalesBillUCResponse buildResponse(List<SalesBillEntity> savedBills) {
//        String primaryId = savedBills.isEmpty() ? "" : savedBills.getFirst().getId().toString();
//        return new AddSalesBillUCResponse(primaryId, "Sales bill added successfully.");
//    }
//}

package com.puff.tech.inventorymanagement.usecase.salesbill.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.inventorymanagement.repository.SalesBillEntity;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.payment.enums.PaymentCategory;
import com.puff.tech.payment.enums.PaymentParty;
import com.puff.tech.payment.enums.PaymentType;
import com.puff.tech.payment.repository.PaymentEntity;
import com.puff.tech.payment.repository.PaymentRepository;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Singleton
public class AddSalesBillUC implements MonoUC<AddSalesBillUCRequest, AddSalesBillUCResponse> {

    private final SalesBillRepository salesBillRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    public AddSalesBillUC(SalesBillRepository salesBillRepository,
                          ProductRepository productRepository,
                          PaymentRepository paymentRepository) {
        this.salesBillRepository = salesBillRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    public Mono<AddSalesBillUCResponse> execute(AddSalesBillUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return validateRequest(request)
                .then(salesBillRepository.acquireMemberLock(memberId))
                .thenMany(processItemsStock(request.items(), memberId))
                .collectList()
                .flatMap(processedItems -> saveSalesBills(request, processedItems, context))
                // Persist to payments table, then pass the saved bills to build response
                .flatMap(savedBills -> savePayment(request, savedBills, context)
                        .thenReturn(savedBills))
                .map(this::buildResponse);
    }

    // --- Private Helper Methods ---

    private Mono<Void> validateRequest(AddSalesBillUCRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Sales bill must contain at least one item."));
        }
        return Mono.empty();
    }

    private Flux<AddSalesBillUCRequest.SalesBillItemRequest> processItemsStock(
            List<AddSalesBillUCRequest.SalesBillItemRequest> items, Long memberId) {
        return Flux.fromIterable(items)
                .flatMap(item -> decrementAndVerifyStock(item, memberId));
    }

    private Mono<AddSalesBillUCRequest.SalesBillItemRequest> decrementAndVerifyStock(
            AddSalesBillUCRequest.SalesBillItemRequest item, Long memberId) {
        return productRepository.decrementStock(item.itemId(), memberId, item.quantity())
                .flatMap(updatedRows -> {
                    if (updatedRows == 0) {
                        return Mono.error(new IllegalStateException(
                                "Insufficient stock or item not found for ID: " + item.itemId()));
                    }
                    return Mono.just(item);
                });
    }

    private Mono<List<SalesBillEntity>> saveSalesBills(
            AddSalesBillUCRequest request,
            List<AddSalesBillUCRequest.SalesBillItemRequest> items,
            UseCaseContext context) {

        List<SalesBillEntity> entities = items.stream()
                .map(item -> createSalesBillEntity(request, item, context))
                .toList();

        return salesBillRepository.saveAll(entities).collectList();
    }

    private SalesBillEntity createSalesBillEntity(
            AddSalesBillUCRequest request,
            AddSalesBillUCRequest.SalesBillItemRequest item,
            UseCaseContext context) {

        SalesBillEntity entity = new SalesBillEntity();
        entity.setBillNumber(request.billNumber());
        entity.setBillDate(request.billDate());
        entity.setPaymentMode(request.paymentMode());
        entity.setPaymentStatus(request.paymentStatus());
        entity.setRemarks(request.remarks());
        entity.setPhotoPath(request.photoPath());

        // Item level details
        entity.setQuantity(item.quantity());
        entity.setUnitPrice(item.unitPrice());
        entity.setTaxPercentage(item.taxPercentage());
        entity.setVatPercentage(item.vatPercentage());
        entity.setTaxAmount(item.taxAmount());
        entity.setVatAmount(item.vatAmount());
        entity.setAmount(item.totalPrice());

        // Customer binding logic (handles optional customer/walk-in customer)
        if (request.customerId() != null && request.customerId() > 0) {
            OrganizationCustomerEntity customer = new OrganizationCustomerEntity();
            customer.setId(Math.toIntExact(request.customerId()));
            entity.setCustomer(customer);
            entity.setCustomerName(request.customerName());
        } else {
            entity.setCustomerName(
                    request.customerName() != null && !request.customerName().isBlank()
                            ? request.customerName()
                            : "Walk-in Customer"
            );
        }

        MemberEntity member = new MemberEntity();
        member.setId(context.securityContext().memberId());
        entity.setMember(member);

        ProductEntity product = new ProductEntity();
        product.setId(item.itemId());
        entity.setProduct(product);

        entity.setCreatedBy(context.securityContext().subject());
        entity.setUpdatedBy(context.securityContext().subject());

        return entity;
    }

    private Mono<PaymentEntity> savePayment(
            AddSalesBillUCRequest request,
            List<SalesBillEntity> savedBills,
            UseCaseContext context) {
        // Only save to payment entity if paymentStatus is "DUE"
        if (request.paymentStatus() == null || !"DUE".equalsIgnoreCase(request.paymentStatus())) {
            return Mono.empty();
        }

        // PaymentEntity validatePartyRelations requires customer != null when party is CUSTOMER.
        // If walk-in (no customer ID), skip payment entity persistence.
        if (request.customerId() == null || request.customerId() <= 0) {
            return Mono.empty();
        }

        // Sum total amount across all bill items
        BigDecimal totalAmount = savedBills.stream()
                .map(SalesBillEntity::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PaymentEntity payment = buildPaymentEntity(request, totalAmount, context);
        return paymentRepository.save(payment);
    }

    private PaymentEntity buildPaymentEntity(
            AddSalesBillUCRequest request,
            BigDecimal totalAmount,
            UseCaseContext context) {

        PaymentEntity entity = new PaymentEntity();

        // Security / Audit context
        MemberEntity member = new MemberEntity();
        member.setId(context.securityContext().memberId());
        entity.setMember(member);

        // Safe User Resolution:
        // Extract userId if numeric; fallback to 1L if userId is an email string to prevent NumberFormatException
        String rawUserId = context.securityContext().userId();
        Long resolvedUserId = (rawUserId != null && rawUserId.matches("\\d+"))
                ? Long.parseLong(rawUserId)
                : 1L; // Fallback primary ID for system/admin accounts

        UserInfoEntity user = new UserInfoEntity();
        user.setId(resolvedUserId);
        entity.setUser(user);

        // createdBy stores the actual username/email string safely
        entity.setCreatedBy(context.securityContext().subject());

        // Core fields
        entity.setPaymentParty(PaymentParty.CUSTOMER);
        entity.setAmount(totalAmount);
//        request.paymentStatus() == DUE
        if(request.paymentStatus().equalsIgnoreCase("DUE")) {
            entity.setPaymentCategory(PaymentCategory.GIVEN);
        } else
            entity.setPaymentCategory(PaymentCategory.RECEIVED);

        entity.setPaymentType(parsePaymentType(request.paymentMode()));
        entity.setBillPath(request.photoPath());

        // Store sales bill metadata and payment status cleanly in remarks
        StringBuilder remarksBuilder = new StringBuilder();
        remarksBuilder.append("Sales Bill: ").append(request.billNumber() != null ? request.billNumber() : "N/A");

        if (!request.paymentStatus().isBlank()) {
            remarksBuilder.append(" | Status: ").append(request.paymentStatus());
        }
        if (request.remarks() != null && !request.remarks().isBlank()) {
            remarksBuilder.append(" | ").append(request.remarks());
        }
        entity.setRemarks(remarksBuilder.toString());

        // Customer mapping
        OrganizationCustomerEntity customer = new OrganizationCustomerEntity();
        customer.setId(Math.toIntExact(request.customerId()));
        entity.setCustomer(customer);

        return entity;
    }

    private PaymentType parsePaymentType(String paymentMode) {
        if (paymentMode == null || paymentMode.isBlank()) {
            return PaymentType.CASH;
        }
        try {
            return PaymentType.valueOf(paymentMode.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PaymentType.CASH;
        }
    }

    private AddSalesBillUCResponse buildResponse(List<SalesBillEntity> savedBills) {
        String primaryId = savedBills.isEmpty() ? "" : savedBills.getFirst().getId().toString();
        return new AddSalesBillUCResponse(primaryId, "Sales bill added successfully.");
    }
}