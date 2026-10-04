package com.puff.tech.inventorymanagement.usecase.category.getAll;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.inventorymanagement.CategoryType;
import com.puff.tech.inventorymanagement.repository.CategoriesEntity;
import com.puff.tech.inventorymanagement.repository.CategoriesRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllCategoriesUC implements FluxUC<GetAllCategoriesUCRequest, GetAllCategoriesUCResponse> {
    private final CategoriesRepository categoriesRepository;

    public GetAllCategoriesUC(CategoriesRepository categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }

    @Override
    public Flux<GetAllCategoriesUCResponse> execute(GetAllCategoriesUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return categoriesRepository.findByMemberId(memberId)
                .map(this::toResponse)
                .onErrorResume(err -> Flux.error(new Throwable(err.getLocalizedMessage())));
    }


    private GetAllCategoriesUCResponse toResponse(CategoriesEntity categories) {
        return GetAllCategoriesUCResponse.builder()
                .id(categories.getId())
                .name(categories.getName())
                .description(categories.getDescription())
                .categoryType(CategoryType.fromTypeIdOrDefault(categories.getCategoryType(), CategoryType.GENERAL))
                .createdAt(categories.getCreatedAt())
                .createdBy(categories.getCreatedBy())
                .updatedAt(categories.getUpdatedAt())
                .updatedBy(categories.getUpdatedBy())
                .build();
    }
}
