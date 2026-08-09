package com.puff.tech.usecase.khatabook.switchkb;

import com.puff.tech.repository.KhataBookRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class SwitchKhataBookUseCase {

    private final KhataBookRepository khataBookRepository;

    @Inject
    public SwitchKhataBookUseCase(KhataBookRepository khataBookRepository) {
        this.khataBookRepository = khataBookRepository;
    }

    public Mono<SwitchKhataBookUseCaseResponse> execute(Integer id){

        return khataBookRepository.resetUsed()
                .then(khataBookRepository.findById(id))
                .switchIfEmpty(Mono.error(new RuntimeException("KhataBook not found")))
                .flatMap(target -> {
                    target.setUsed(true);
                    return khataBookRepository.update(target);
                })
                .map(data -> new SwitchKhataBookUseCaseResponse("Success"));
    }
}
