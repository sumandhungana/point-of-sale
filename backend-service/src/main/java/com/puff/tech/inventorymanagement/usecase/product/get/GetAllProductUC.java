package com.puff.tech.inventorymanagement.usecase.product.get;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;

@Singleton
public class GetAllProductUC implements MonoUC<GetAllProductUCRequest, GetAllProductUCResponse> {

    private final ProductRepository productRepository;

    public GetAllProductUC(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public Mono<GetAllProductUCResponse> execute(GetAllProductUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return productRepository.findByMemberId(memberId)
                .collectList()
                .flatMap(products -> {
                    // Map entities to ItemDto records
                    List<GetAllProductUCResponse.ItemDto> itemDtos = products.stream()
                            .map(this::mapToItemDto)
                            .toList();

                    // Calculate total sales valuation: Sum of (salesPrice * openingStock)
                    BigDecimal totalSalesPrice = products.stream()
                            .filter(p -> p.getSalesPrice() != null && p.getOpeningStock() != null)
                            .map(p -> p.getSalesPrice().multiply(BigDecimal.valueOf(p.getOpeningStock())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    long totalItems = products.size();

                    GetAllProductUCResponse response = new GetAllProductUCResponse(
                            itemDtos,
                            totalSalesPrice,
                            totalItems
                    );

                    return Mono.just(response);
                });
    }

    private GetAllProductUCResponse.ItemDto mapToItemDto(ProductEntity entity) {
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
                entity.getSalesPrice() != null ? entity.getSalesPrice() : BigDecimal.ZERO,
                entity.getPerUnitPurchasePrice(),
                entity.getGrossPurchasePrice(),
                entity.getOpeningStock() != null ? entity.getOpeningStock() : 0.0,
                entity.getImageUrl(),
                categoryDto,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy(),
                entity.getUpdatedBy()
        );
    }
}
