package com.puff.tech.usecase.khatabook.update;

import com.puff.tech.covertor.KhataBookConvertor;
import com.puff.tech.repository.KhataBookRepository;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateKhataBookUseCase  {

    private final KhataBookRepository khataBookRepository;

    public UpdateKhataBookUseCase(KhataBookRepository khataBookRepository){
        this.khataBookRepository= khataBookRepository;
    }

    public Mono<UpdateKhataBookUseCaseResponse> execute(UpdateKhataBookUseCaseRequest request, Integer id) {
        return khataBookRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Khatabook not found")))
                .flatMap(khataBookEntity -> {
                    KhataBookConvertor.toUpdateEntity(request,khataBookEntity);
                    return   khataBookRepository.update(khataBookEntity);

                })
                .map(updatedKhataBook-> new UpdateKhataBookUseCaseResponse("Updated successfully"))
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened")));
    }
}
