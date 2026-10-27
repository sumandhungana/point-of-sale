package com.puff.tech.inventorymanagement.usecase.product.get;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.inventorymanagement.repository.PurchaseBillRepository;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Singleton
public class GetProductByIdUC implements MonoUC<GetProductByIdUCRequest, GetProductByIdUCResponse> {
    private final ProductRepository productRepository;
    private final SalesBillRepository salesBillRepository;
    private final PurchaseBillRepository purchaseBillRepository;

    public GetProductByIdUC(ProductRepository productRepository,
                            SalesBillRepository salesBillRepository,
                            PurchaseBillRepository purchaseBillRepository) {
        this.productRepository = productRepository;
        this.salesBillRepository = salesBillRepository;
        this.purchaseBillRepository = purchaseBillRepository;
    }

    @Override
    public Mono<GetProductByIdUCResponse> execute(GetProductByIdUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        return productRepository.findByIdAndMemberId(request.productId(), memberId)
                .switchIfEmpty(Mono.error(new RuntimeException("Product not found with ID: " + request.productId())))
                .flatMap(product -> calculateProductFinancials(product, memberId));
    }

    private Mono<GetProductByIdUCResponse> calculateProductFinancials(ProductEntity product, Long memberId) {
        // Fetch actual sum from purchase_bill for this product
        Mono<BigDecimal> purchaseBillTotalMono = purchaseBillRepository
                .findTotalAmountByProductIdAndMemberId(product.getId(), memberId)
                .defaultIfEmpty(BigDecimal.ZERO);

        // Fetch actual sum from sales_bill for this product
        Mono<BigDecimal> salesBillTotalMono = salesBillRepository
                .findTotalAmountByProductIdAndMemberId(product.getId(), memberId)
                .defaultIfEmpty(BigDecimal.ZERO);

        return Mono.zip(purchaseBillTotalMono, salesBillTotalMono)
                .map(tuple -> {
                    BigDecimal additionalPurchases = tuple.getT1();
                    BigDecimal actualSalesAmount = tuple.getT2();

                    // Initial inventory gross purchase price
                    BigDecimal initialGross = product.getGrossPurchasePrice() != null
                            ? product.getGrossPurchasePrice()
                            : BigDecimal.ZERO;

                    // Combined Purchase Amount = Initial Gross Purchase + Cumulative Purchase Bills
                    BigDecimal totalPurchaseAmount = initialGross.add(additionalPurchases);

                    return mapToResponse(product, totalPurchaseAmount, actualSalesAmount);
                });
    }

    private GetProductByIdUCResponse mapToResponse(
            ProductEntity entity,
            BigDecimal totalPurchaseAmount,
            BigDecimal actualSalesAmount
    ) {
        GetAllProductUCResponse.CategoryDto categoryDto = null;
        if (entity.getCategory() != null) {
            categoryDto = new GetAllProductUCResponse.CategoryDto(
                    entity.getCategory().getId(),
                    entity.getCategory().getName()
            );
        }

        return new GetProductByIdUCResponse(
                entity.getId(),
                entity.getName(),
                entity.getItemCount(),
                entity.getUnit(),
                entity.getFixedSellingPrice() != null ? entity.getFixedSellingPrice() : BigDecimal.ZERO,
                entity.getPerUnitPurchasePrice(),
                totalPurchaseAmount, // Initial gross + additional purchase_bill amounts
                actualSalesAmount,   // Actual tracked revenue strictly from sales_bill
                entity.getTaxPercentage(),
                entity.getVatPercentage(),
                entity.getImageUrl(),
                categoryDto,
                entity.getLowStockAlert() != null
                        ? Double.valueOf(String.valueOf(entity.getLowStockAlert())).longValue()
                        : 0L,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy(),
                entity.getUpdatedBy()
        );
    }

}
