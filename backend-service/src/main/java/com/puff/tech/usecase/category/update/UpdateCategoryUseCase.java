package com.puff.tech.usecase.category.update;

import com.puff.tech.covertor.CategoryConvertor;
import com.puff.tech.repository.CategoryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateCategoryUseCase {

    private final CategoryRepository categoryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateCategoryUseCase(CategoryRepository categoryRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.categoryRepository = categoryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<UpdateCategoryUseCaseResponse> execute(UpdateCategoryUseCaseRequest request, Integer id) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->
                        categoryRepository.findByIdAndKhataBookId(id, khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Category not found")))
                                .flatMap(existing -> {


                                    CategoryConvertor.toUpdateEntity(existing, request);

                                    return categoryRepository.update(existing);
                                })
                                .thenReturn(new UpdateCategoryUseCaseResponse("Updated successfully"))
                );
    }
}