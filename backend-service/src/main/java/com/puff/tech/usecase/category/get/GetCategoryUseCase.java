package com.puff.tech.usecase.category.get;

import com.puff.tech.covertor.CategoryConvertor;
import com.puff.tech.repository.CategoryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetCategoryUseCase {

    private final CategoryRepository categoryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetCategoryUseCase(CategoryRepository categoryRepository, KhataBookImplementation khataBookImplementation) {
        this.categoryRepository = categoryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetCategoryUseCaseResponse> execute(){
        Integer khataBookId= khataBookImplementation.getCurrentKhataBookId().block();
        return categoryRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                .map(CategoryConvertor::toGetCategory)
                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened")));
    }
}
