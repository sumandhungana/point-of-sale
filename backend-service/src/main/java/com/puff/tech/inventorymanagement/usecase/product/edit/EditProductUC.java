package com.puff.tech.inventorymanagement.usecase.product.edit;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.convertor.ProductConvertor;
import com.puff.tech.inventorymanagement.repository.CategoriesRepository;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class EditProductUC implements MonoUC<EditProductUCRequest, EditProductUCResponse> {
    private final CategoriesRepository categoriesRepository;
    private final ProductRepository productRepository;

    public EditProductUC(CategoriesRepository categoriesRepository,
                        ProductRepository productRepository) {
        this.categoriesRepository = categoriesRepository;
        this.productRepository = productRepository;
    }
    @Override
    public Mono<EditProductUCResponse> execute(EditProductUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        String userId = context.securityContext().subject();

        return productRepository.findById(request.itemId())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found with id: " + request.itemId())))
                .flatMap(existingProduct -> {
                    // Only fetch category if categoryId was provided in the request
                    if (request.categoryId() != null) {
                        return categoriesRepository.findById(request.categoryId())
                                .switchIfEmpty(Mono.error(new IllegalArgumentException("Category not found with id: " + request.categoryId())))
                                .map(category -> ProductConvertor.updateEntity(existingProduct, request, memberId, userId, category));
                    }
                    return Mono.just(ProductConvertor.updateEntity(existingProduct, request, memberId, userId, null));
                })
                .flatMap(productRepository::save)
                .map(this::toResponse);
    }

    private EditProductUCResponse toResponse(ProductEntity product) {
        return EditProductUCResponse.builder()
                .id(product.getId())
                .message("Product updated successfully")
                .build();
    }
}
