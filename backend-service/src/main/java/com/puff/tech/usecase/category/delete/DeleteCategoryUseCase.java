package com.puff.tech.usecase.category.delete;

import com.puff.tech.repository.CategoryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteCategoryUseCase {

    private final CategoryRepository categoryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteCategoryUseCase(CategoryRepository categoryRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.categoryRepository = categoryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<DeleteCategoryUseCaseResponse> execute(Integer id){
      return khataBookImplementation.getCurrentKhataBookId()
              .flatMap(khataBookId->
                      categoryRepository.findByIdAndKhataBookId(id, khataBookId)
                              .switchIfEmpty(Mono.error(new RuntimeException("Category not found")))
                              .flatMap(categoryEntity ->
                              categoryRepository.deleteById(id)
                              )
                              .thenReturn(new DeleteCategoryUseCaseResponse("Successfully deleted"))

              ).
              onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened")));
    }
}
