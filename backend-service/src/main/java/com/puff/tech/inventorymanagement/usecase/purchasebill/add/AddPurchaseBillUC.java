package com.puff.tech.inventorymanagement.usecase.purchasebill.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.inventorymanagement.repository.PurchaseBillEntity;
import com.puff.tech.inventorymanagement.repository.PurchaseBillRepository;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.payment.enums.PaymentCategory;
import com.puff.tech.payment.enums.PaymentParty;
import com.puff.tech.payment.enums.PaymentType;
import com.puff.tech.payment.repository.PaymentEntity;
import com.puff.tech.payment.repository.PaymentRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.suppliermanagement.repository.SupplierEntity;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Singleton
public class AddPurchaseBillUC implements MonoUC<AddPurchaseBillUCRequest, AddPurchaseBillUCResponse> {

    private final PurchaseBillRepository purchaseBillRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    public AddPurchaseBillUC(PurchaseBillRepository purchaseBillRepository,
                             ProductRepository productRepository, PaymentRepository paymentRepository) {
        this.purchaseBillRepository = purchaseBillRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public Mono<AddPurchaseBillUCResponse> execute(AddPurchaseBillUCRequest request, UseCaseContext context) {
        // 1. Group items by productId to prevent race conditions or duplicate additions
        // if the same product appears multiple times in a single request list.
        return Flux.fromIterable(request.items())
                .groupBy(AddPurchaseBillUCRequest.PurchaseItemDto::productId)
                .flatMap(groupedFlux ->
                        groupedFlux.collectList().flatMap(itemsForProduct -> {
                            Long productId = groupedFlux.key();

                            // Aggregate total item count for this product in this request
                            double totalItemCount = itemsForProduct.stream()
                                    .mapToDouble(AddPurchaseBillUCRequest.PurchaseItemDto::itemCount)
                                    .sum();

                            // Aggregate total gross price for this product batch
                            BigDecimal totalBatchGrossPrice = itemsForProduct.stream()
                                    .map(item -> item.perUnitPurchasePrice().multiply(BigDecimal.valueOf(item.itemCount())))
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                            // Use the latest per-unit price from the last item in the group
                            BigDecimal latestPerUnit = itemsForProduct.getLast().perUnitPurchasePrice();

                            return findProduct(productId)
                                    .flatMap(product -> updateProductStockAndPrices(product, totalItemCount, totalBatchGrossPrice, latestPerUnit));
                        })
                )
                .collectList()
                .flatMap(updatedProducts -> saveBillRecords(updatedProducts, request, context))
                .flatMap(savedBills -> savePayment(request, savedBills, context)
                        .thenReturn(savedBills))
                .map(this::toResponse);
    }

    private Mono<ProductEntity> findProduct(Long productId) {
        return productRepository.findById(productId)
                .switchIfEmpty(Mono.error(new RuntimeException("Product not found with id: " + productId)));
    }

    private Mono<ProductEntity> updateProductStockAndPrices(ProductEntity product, double additionalCount, BigDecimal batchGrossPrice, BigDecimal perUnitPurchasePrice) {
        // 1. Calculate updated item count
        double existingCount = product.getItemCount() != null ? product.getItemCount() : 0.0;
        double updatedItemCount = existingCount + additionalCount;

        // 2. Accumulate with existing gross price
        BigDecimal existingGrossPrice = product.getGrossPurchasePrice() != null
                ? product.getGrossPurchasePrice()
                : BigDecimal.ZERO;
        BigDecimal updatedGrossPrice = existingGrossPrice.add(batchGrossPrice);

        // 3. Update product fields
        product.setItemCount(updatedItemCount);
//        product.setPerUnitPurchasePrice(perUnitPurchasePrice);
//        product.setGrossPurchasePrice(updatedGrossPrice);

        return productRepository.update(product);
    }

    private Mono<List<PurchaseBillEntity>> saveBillRecords(List<ProductEntity> updatedProducts, AddPurchaseBillUCRequest request, UseCaseContext context) {
        // Save a purchase bill record for each updated product / item group
        return Flux.fromIterable(request.items())
                .flatMap(itemDto -> {
                    BigDecimal itemGrossPrice = itemDto.perUnitPurchasePrice()
                            .multiply(BigDecimal.valueOf(itemDto.itemCount()));

                    // Find the matching updated product entity
                    ProductEntity matchedProduct = updatedProducts.stream()
                            .filter(p -> p.getId().equals(itemDto.productId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Product not found in updated list: " + itemDto.productId()));

                    PurchaseBillEntity purchaseBill = new PurchaseBillEntity();
                    if(request.supplierId() != null) {
                        SupplierEntity supplier = new SupplierEntity();
                        supplier.setId(Math.toIntExact(request.supplierId()));
                        purchaseBill.setSupplier(supplier);
                        purchaseBill.setSupplierName(request.supplierName());
                    } else {
                        purchaseBill.setSupplierName("Walk-In Supplier");
                    }
                    purchaseBill.setProduct(matchedProduct);
                    purchaseBill.setPurchaseNo(request.purchaseNo());
                    purchaseBill.setPurchaseDate(request.purchaseDate() != null ? request.purchaseDate() : LocalDate.now());
                    purchaseBill.setPaymentMode(request.paymentMode());
                    purchaseBill.setPaymentStatus(request.paymentStatus());
                    purchaseBill.setAmount(itemGrossPrice);
                    purchaseBill.setRemarks(request.remarks());
                    purchaseBill.setPhotoPath(request.photoPath());

                    if (context != null && context.securityContext() != null && context.securityContext().memberId() != null) {
                        MemberEntity member = new MemberEntity();
                        member.setId(context.securityContext().memberId());
                        purchaseBill.setMember(member);
                        purchaseBill.setCreatedBy(context.securityContext().subject());
                    }

                    return purchaseBillRepository.save(purchaseBill);
                })
                .collectList(); // Collected as List so total amount can be summed for payment
    }

private Mono<PaymentEntity> savePayment(
        AddPurchaseBillUCRequest request,
        List<PurchaseBillEntity> savedBills,
        UseCaseContext context) {
    // Only save to payment entity if paymentStatus is "DUE"
    if (request.paymentStatus() == null || !"DUE".equalsIgnoreCase(request.paymentStatus())) {
        return Mono.empty();
    }

    // If walk-in supplier (no supplier ID), skip payment entity persistence
    if (request.supplierId() == null || request.supplierId() <= 0) {
        return Mono.empty();
    }

    // Sum total amount across all bill items
    BigDecimal totalAmount = savedBills.stream()
            .map(PurchaseBillEntity::getAmount)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    PaymentEntity payment = buildPaymentEntity(request, totalAmount, context);
    return paymentRepository.save(payment);
}

    private PaymentEntity buildPaymentEntity(
            AddPurchaseBillUCRequest request,
            BigDecimal totalAmount,
            UseCaseContext context) {

        PaymentEntity entity = new PaymentEntity();

        // Security / Audit context
        MemberEntity member = new MemberEntity();
        member.setId(context.securityContext().memberId());
        entity.setMember(member);

        // Safe User Resolution
        String rawUserId = context.securityContext().userId();
        Long resolvedUserId = (rawUserId != null && rawUserId.matches("\\d+"))
                ? Long.parseLong(rawUserId)
                : 1L;

        UserInfoEntity user = new UserInfoEntity();
        user.setId(resolvedUserId);
        entity.setUser(user);

        entity.setCreatedBy(context.securityContext().subject());

        // Core fields
        entity.setPaymentParty(PaymentParty.SUPPLIER);
        entity.setAmount(totalAmount);

        if (request.paymentStatus().equalsIgnoreCase("DUE")) {
            entity.setPaymentCategory(PaymentCategory.RECEIVED);
        } else {
            entity.setPaymentCategory(PaymentCategory.GIVEN);
        }

        entity.setPaymentType(parsePaymentType(request.paymentMode()));
        entity.setBillPath(request.photoPath());

        // Store purchase bill metadata cleanly in remarks
        StringBuilder remarksBuilder = new StringBuilder();
        remarksBuilder.append("Purchase Bill: ").append(request.purchaseNo() != null ? request.purchaseNo() : "N/A");

        if (!request.paymentStatus().isBlank()) {
            remarksBuilder.append(" | Status: ").append(request.paymentStatus());
        }
        if (request.remarks() != null && !request.remarks().isBlank()) {
            remarksBuilder.append(" | ").append(request.remarks());
        }
        entity.setRemarks(remarksBuilder.toString());

        // Supplier mapping
        SupplierEntity supplier = new SupplierEntity();
        supplier.setId(Math.toIntExact(request.supplierId()));
        entity.setSupplier(supplier);

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

    private AddPurchaseBillUCResponse toResponse(List<PurchaseBillEntity> savedBills) {
        PurchaseBillEntity lastBill = savedBills.isEmpty() ? null : savedBills.getLast();
        Long primaryId = Long.valueOf(lastBill != null ? lastBill.getId() : null);
        String purchaseNo = lastBill != null ? lastBill.getPurchaseNo() : "";
        return new AddPurchaseBillUCResponse(Math.toIntExact(primaryId), purchaseNo);
    }
}
