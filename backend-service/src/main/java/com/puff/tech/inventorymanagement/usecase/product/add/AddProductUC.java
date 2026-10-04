package com.puff.tech.inventorymanagement.usecase.product.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.convertor.ProductConvertor;
import com.puff.tech.inventorymanagement.repository.CategoriesRepository;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class AddProductUC implements MonoUC<AddProductUCRequest, AddProductUCResponse> {

    private final CategoriesRepository categoriesRepository;
    private final ProductRepository productRepository;

    public AddProductUC(CategoriesRepository categoriesRepository,
                        ProductRepository productRepository) {
        this.categoriesRepository = categoriesRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Mono<AddProductUCResponse> execute(AddProductUCRequest request, UseCaseContext context) {
        Long memberId= context.securityContext().memberId();
        String userId= context.securityContext().subject();

        return categoriesRepository.findById(request.categoryId())
                .switchIfEmpty(Mono.error(new Throwable("Category did not found")))
                .flatMap(categoriesEntity -> productRepository
                        .save(ProductConvertor.toRequest(request, memberId, userId, categoriesEntity))
                        .map(this::toResponse));

    };

    private AddProductUCResponse toResponse(ProductEntity product) {
        return AddProductUCResponse.builder()
                .id(product.getId())
                .message("Product created successfully")
                .build();
    }

}
