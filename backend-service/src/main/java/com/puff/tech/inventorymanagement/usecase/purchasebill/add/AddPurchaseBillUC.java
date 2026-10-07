package com.puff.tech.inventorymanagement.usecase.purchasebill.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.inventorymanagement.repository.PurchaseBillEntity;
import com.puff.tech.inventorymanagement.repository.PurchaseBillRepository;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;

@Singleton
public class AddPurchaseBillUC implements MonoUC<AddPurchaseBillUCRequest, AddPurchaseBillUCResponse> {

    private final PurchaseBillRepository purchaseBillRepository;
    private final ProductRepository productRepository;

    public AddPurchaseBillUC(PurchaseBillRepository purchaseBillRepository,
                             ProductRepository productRepository) {
        this.purchaseBillRepository = purchaseBillRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Mono<AddPurchaseBillUCResponse> execute(AddPurchaseBillUCRequest request, UseCaseContext context) {
        // Process each item in the request list reactively
        return Flux.fromIterable(request.items())
                .flatMap(itemDto ->
                        findProduct(itemDto.productId())
                                .flatMap(product -> updateProductStockAndPrices(product, itemDto))
                                .flatMap(savedProduct -> saveBillRecord(savedProduct, itemDto, request, context))
                )
                .last() // Take the last saved bill to construct the final response, or collect them if needed
                .map(this::toResponse);
    }

    private Mono<ProductEntity> findProduct(Long productId) {
        return productRepository.findById(productId)
                .switchIfEmpty(Mono.error(new RuntimeException("Product not found with id: " + productId)));
    }

    private Mono<ProductEntity> updateProductStockAndPrices(ProductEntity product, AddPurchaseBillUCRequest.PurchaseItemDto itemDto) {
        // 1. Calculate updated item count
        double existingCount = product.getItemCount() != null ? product.getItemCount() : 0.0;
        double updatedItemCount = existingCount + itemDto.itemCount();

        // 2. Calculate gross price for the new purchase batch
        BigDecimal newBatchGrossPrice = itemDto.perUnitPurchasePrice()
                .multiply(BigDecimal.valueOf(itemDto.itemCount()));

        // 3. Accumulate with existing gross price
        BigDecimal existingGrossPrice = product.getGrossPurchasePrice() != null
                ? product.getGrossPurchasePrice()
                : BigDecimal.ZERO;
        BigDecimal updatedGrossPrice = existingGrossPrice.add(newBatchGrossPrice);

        // 4. Update product fields
        product.setItemCount(updatedItemCount);
        product.setPerUnitPurchasePrice(itemDto.perUnitPurchasePrice());
        product.setGrossPurchasePrice(updatedGrossPrice);

        return productRepository.update(product);
    }

    private Mono<PurchaseBillEntity> saveBillRecord(ProductEntity product, AddPurchaseBillUCRequest.PurchaseItemDto itemDto, AddPurchaseBillUCRequest request, UseCaseContext context) {
        BigDecimal grossPrice = itemDto.perUnitPurchasePrice()
                .multiply(BigDecimal.valueOf(itemDto.itemCount()));

        PurchaseBillEntity purchaseBill = new PurchaseBillEntity();
        purchaseBill.setProduct(product);
        purchaseBill.setPurchaseNo(request.purchaseNo());
        purchaseBill.setPurchaseDate(request.purchaseDate() != null ? request.purchaseDate() : LocalDate.now());
        purchaseBill.setPaymentMode(request.paymentMode());
        purchaseBill.setAmount(grossPrice);
        purchaseBill.setRemarks(request.remarks());
        purchaseBill.setPhotoPath(request.photoPath());

        if (context != null && context.securityContext() != null && context.securityContext().memberId() != null) {
            MemberEntity member = new MemberEntity();
            member.setId(context.securityContext().memberId());
            purchaseBill.setMember(member);
            purchaseBill.setCreatedBy(context.securityContext().subject());
        }

        return purchaseBillRepository.save(purchaseBill);
    }

    private AddPurchaseBillUCResponse toResponse(PurchaseBillEntity savedBill) {
        return new AddPurchaseBillUCResponse(savedBill.getId(), savedBill.getPurchaseNo());
    }
}
