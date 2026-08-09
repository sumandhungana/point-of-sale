package com.puff.tech.usecase.category.getone;

import com.puff.tech.covertor.CategoryConvertor;
import com.puff.tech.repository.CategoryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.category.get.GetCategoryUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetSingleCategoryUseCase {

    private final CategoryRepository categoryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetSingleCategoryUseCase(CategoryRepository categoryRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.categoryRepository = categoryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<GetCategoryUseCaseResponse> execute(Integer id){
        Integer khataBookId= khataBookImplementation.getCurrentKhataBookId().block();
        return categoryRepository.findByIdAndKhataBookId(id, khataBookId)
                .map(CategoryConvertor::toGetCategory)
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happpened")));
    }
}
