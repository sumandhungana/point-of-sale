package com.puff.tech.usecase.category.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.CategoryConvertor;
import com.puff.tech.repository.CategoryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateCategoryUseCase implements UseCase<CreateCategoryUseCaseRequest, CreateCategoryUseCaseResponse> {

    private final CategoryRepository categoryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateCategoryUseCase(CategoryRepository categoryRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.categoryRepository = categoryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateCategoryUseCaseResponse> execute(CreateCategoryUseCaseRequest request) {
        Integer khataBookId= khataBookImplementation.getCurrentKhataBookId().block();
        var category= CategoryConvertor.toEntity(request,khataBookId);
        return categoryRepository.save(category)
                .map(data->new CreateCategoryUseCaseResponse("Category created successfully"))
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected hapened")));
    }
}
