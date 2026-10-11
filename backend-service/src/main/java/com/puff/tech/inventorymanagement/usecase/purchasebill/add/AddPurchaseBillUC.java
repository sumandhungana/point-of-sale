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
import java.util.List;

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

    private Mono<PurchaseBillEntity> saveBillRecords(List<ProductEntity> updatedProducts, AddPurchaseBillUCRequest request, UseCaseContext context) {
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
                    purchaseBill.setProduct(matchedProduct);
                    purchaseBill.setPurchaseNo(request.purchaseNo());
                    purchaseBill.setPurchaseDate(request.purchaseDate() != null ? request.purchaseDate() : LocalDate.now());
                    purchaseBill.setPaymentMode(request.paymentMode());
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
                .last(); // Take the last saved bill entity to pass to the response mapper
    }

    private AddPurchaseBillUCResponse toResponse(PurchaseBillEntity savedBill) {
        return new AddPurchaseBillUCResponse(savedBill.getId(), savedBill.getPurchaseNo());
    }
}
