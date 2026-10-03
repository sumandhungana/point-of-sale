package com.puff.tech.inventorymanagement.usecase.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.CategoriesEntity;
import com.puff.tech.inventorymanagement.repository.CategoriesRepository;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Singleton
public class AddCategoriesUC implements MonoUC<AddCategoriesUCRequest, AddCategoriesUCResponse> {

    private final CategoriesRepository categoriesRepository;

    public AddCategoriesUC(CategoriesRepository categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }

    @Override
    public Mono<AddCategoriesUCResponse> execute(AddCategoriesUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        String userId = context.securityContext().subject();
        // 1. Validate request parameters
        if (request == null || request.name() == null || request.name().isBlank()) {
            return Mono.error(new IllegalArgumentException("Category name must not be empty"));
        }
        if (request.categoryType() == null) {
            return Mono.error(new IllegalArgumentException("Category type must not be null"));
        }

        // 2. Prepare entity and execute reactive pipeline
        CategoriesEntity entity = prepareCategoriesEntity(request, memberId, userId);

        return categoriesRepository.save(entity)
                .map(this::prepareResponse)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Failed to save category")))
                .onErrorResume(throwable -> {
                    // Log error and translate into a custom domain/business exception
                    return Mono.error(new IllegalArgumentException("Failed to add category: " + throwable.getMessage(), throwable));
                });
    }

    private AddCategoriesUCResponse prepareResponse(CategoriesEntity saved) {
        return new AddCategoriesUCResponse(
                saved.getId(),
                "Category saved successfully !!"
        );
    }

    private CategoriesEntity prepareCategoriesEntity(AddCategoriesUCRequest request, Long memberId,
                                                     String userId) {
        CategoriesEntity entity = new CategoriesEntity();
        entity.setCategoryType(request.categoryType().getTypeId());
        entity.setName(request.name());
        entity.setDescription(request.description());
        if (memberId != null) {
            MemberEntity memberEntity = new MemberEntity();
            memberEntity.setId(memberId);
            entity.setMember(memberEntity);
        }
        entity.setCreatedAt(Instant.now());
        entity.setCreatedBy(userId);
        return entity;
    }
}
