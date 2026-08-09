package com.puff.tech.usecase.khatabook.findall;

import com.puff.tech.covertor.KhataBookConvertor;
import com.puff.tech.repository.KhataBookRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetKhataBookUseCase {

    private final KhataBookRepository khataBookRepository;

    @Inject
    public GetKhataBookUseCase(KhataBookRepository khataBookRepository){
        this.khataBookRepository=khataBookRepository;
    }

    public Flux<GetKhataBookUseCaseResponse> execute(){
        return khataBookRepository.findAll()
                .map(KhataBookConvertor::getAllKhataBook)
                .onErrorResume(err-> Flux.error(new Throwable("Unexpected happened while getting khata book"+err.getLocalizedMessage())));
    }
}
