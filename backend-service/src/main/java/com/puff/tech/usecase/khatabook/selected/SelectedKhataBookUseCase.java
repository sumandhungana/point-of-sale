package com.puff.tech.usecase.khatabook.selected;

import com.puff.tech.repository.KhataBookRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class SelectedKhataBookUseCase {

    private final KhataBookRepository khataBookRepository;

    @Inject
    public SelectedKhataBookUseCase(KhataBookRepository khataBookRepository) {
        this.khataBookRepository = khataBookRepository;
    }

    public Mono<SelectedKhataBookUseCaseResponse> execute(){
        return khataBookRepository.findByUsedTrue()
                .switchIfEmpty(Mono.error(new RuntimeException("KhataBook not found")))
                .map(khataBookEntity -> new SelectedKhataBookUseCaseResponse(
                        khataBookEntity.getId(),
                        khataBookEntity.getCompanyName(),
                        khataBookEntity.getName(),
                        khataBookEntity.getName()

                ));

    }
}
