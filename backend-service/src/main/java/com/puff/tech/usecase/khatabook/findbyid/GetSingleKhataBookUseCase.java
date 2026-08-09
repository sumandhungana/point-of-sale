package com.puff.tech.usecase.khatabook.findbyid;

import com.puff.tech.covertor.KhataBookConvertor;
import com.puff.tech.repository.KhataBookRepository;
import com.puff.tech.usecase.khatabook.findall.GetKhataBookUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetSingleKhataBookUseCase {

    private final KhataBookRepository khataBookRepository;

    @Inject
    public GetSingleKhataBookUseCase(KhataBookRepository khataBookRepository){
        this.khataBookRepository=khataBookRepository;
    }

    public Mono<GetKhataBookUseCaseResponse> execute(Integer id){
        return khataBookRepository.findById(id)
                .map(KhataBookConvertor::getAllKhataBook)
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened while geting khatabook"+err.getLocalizedMessage())));
    }
}
