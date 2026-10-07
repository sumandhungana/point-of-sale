package com.puff.tech.inventorymanagement.usecase.product.get;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.*;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;

@Singleton
public class GetAllProductUC implements MonoUC<GetAllProductUCRequest, GetAllProductUCResponse> {

    private final ProductRepository productRepository;
    private final SalesBillRepository salesBillRepository;
    private final PurchaseBillRepository purchaseBillRepository;

    public GetAllProductUC(ProductRepository productRepository,
                           SalesBillRepository salesBillRepository,
                           PurchaseBillRepository purchaseBillRepository) {
        this.productRepository = productRepository;
        this.salesBillRepository = salesBillRepository;
        this.purchaseBillRepository = purchaseBillRepository;
    }

    @Override
    public Mono<GetAllProductUCResponse> execute(GetAllProductUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        return productRepository.findByMemberId(memberId)
                .collectList()
                .flatMap(products -> {
                    if (products.isEmpty()) {
                        return Mono.just(new GetAllProductUCResponse(List.of(), BigDecimal.ZERO, 0L));
                    }

                    // Process each product concurrently to map DTOs with calculated purchase & sales amounts
                    return Flux.fromIterable(products)
                            .flatMap(product -> calculateProductFinancials(product, memberId))
                            .collectList()
                            .map(itemDtos -> {
                                // Total Actual Sales Revenue: Sum of actual sales recorded in sales_bill across all items
                                BigDecimal totalActualSalesAmount = itemDtos.stream()
                                        .map(GetAllProductUCResponse.ItemDto::totalSalesAmount)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                return new GetAllProductUCResponse(
                                        itemDtos,
                                        totalActualSalesAmount,
                                        (long) itemDtos.size()
                                );
                            });
                });
    }

    private Mono<GetAllProductUCResponse.ItemDto> calculateProductFinancials(ProductEntity product, Long memberId) {
        // Fetch actual sum from purchase_bill for this product
        Mono<BigDecimal> purchaseBillTotalMono = purchaseBillRepository.findTotalAmountByProductIdAndMemberId(product.getId(), memberId)
                .defaultIfEmpty(BigDecimal.ZERO);

        // Fetch actual sum from sales_bill for this product
        Mono<BigDecimal> salesBillTotalMono = salesBillRepository.findTotalAmountByProductIdAndMemberId(product.getId(), memberId)
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

                    return mapToItemDto(product, totalPurchaseAmount, actualSalesAmount);
                });
    }

    private GetAllProductUCResponse.ItemDto mapToItemDto(
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

        return new GetAllProductUCResponse.ItemDto(
                entity.getId(),
                entity.getName(),
                entity.getItemCount(),
                entity.getUnit(),
                entity.getFixedSellingPrice() != null ? entity.getFixedSellingPrice() : BigDecimal.ZERO, // Fixed Unit Selling Price metadata
                entity.getPerUnitPurchasePrice(),
                totalPurchaseAmount, // Initial gross + additional purchase_bill amounts
                actualSalesAmount,   // Actual tracked revenue strictly from sales_bill
                entity.getTaxPercentage(),
                entity.getVatPercentage(),
                entity.getImageUrl(),
                categoryDto,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy(),
                entity.getUpdatedBy()
        );
    }
}
