package com.puff.tech.inventorymanagement.usecase.product.delete;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.inventorymanagement.repository.PurchaseBillRepository;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteProductUC implements MonoUC<DeleteProductUCRequest, DeleteProductUCResponse> {
    private final ProductRepository productRepository;
    private final SalesBillRepository salesBillRepository;
    private final PurchaseBillRepository purchaseBillRepository;

    public DeleteProductUC(ProductRepository productRepository,
                           SalesBillRepository salesBillRepository,
                           PurchaseBillRepository purchaseBillRepository) {
        this.productRepository = productRepository;
        this.salesBillRepository = salesBillRepository;
        this.purchaseBillRepository = purchaseBillRepository;
    }

    @Override
    public Mono<DeleteProductUCResponse> execute(DeleteProductUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        // 1. Verify the product exists and belongs to the authenticated member
        return productRepository.findByIdAndMemberId(request.id(), memberId)
                .switchIfEmpty(Mono.error(new RuntimeException("Product not found with ID: " + request.id())))
                .flatMap(product -> {
                    // 2. Delete associated sales bills and purchase bills concurrently
                    Mono<Long> deleteSalesBills = salesBillRepository.deleteByProductIdAndMemberId(request.id(), memberId);
                    Mono<Long> deletePurchaseBills = purchaseBillRepository.deleteByProductIdAndMemberId(request.id(), memberId);

                    return Mono.when(deleteSalesBills, deletePurchaseBills)
                            // 3. Once bills are deleted, delete the product itself
                            .then(productRepository.delete(product))
                            // 4. Return the response containing the deleted product ID
                            .then(Mono.just(new DeleteProductUCResponse("Successfully deleted : "+request.id())));
                });
    }
}
