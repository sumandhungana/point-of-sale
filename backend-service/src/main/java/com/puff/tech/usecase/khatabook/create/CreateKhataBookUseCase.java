package com.puff.tech.usecase.khatabook.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.KhataBookConvertor;
import com.puff.tech.repository.KhataBookRepository;
import io.micronaut.core.annotation.Creator;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateKhataBookUseCase implements UseCase<CreateKhataBookUseCaseRequest,CreateKhataBookUseCaseResponse> {

    private final KhataBookRepository khataBookRepository;

    @Inject
    public CreateKhataBookUseCase(KhataBookRepository khataBookRepository){
        this.khataBookRepository=khataBookRepository;
    }

    @Override
    public Mono<CreateKhataBookUseCaseResponse> execute(CreateKhataBookUseCaseRequest request){
       var khataBook= KhataBookConvertor.toEntity(request);
       return khataBookRepository.save(khataBook)
               .map(khataBookEntity -> new CreateKhataBookUseCaseResponse("Khatabook created"))
               .onErrorResume(err->Mono.error(new Throwable("Unexpected happened while creting khatabook"+err.getLocalizedMessage())));
    }
}
