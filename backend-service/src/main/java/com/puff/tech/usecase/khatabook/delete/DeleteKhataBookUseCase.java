package com.puff.tech.usecase.khatabook.delete;

import com.puff.tech.repository.KhataBookRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteKhataBookUseCase {

    private final KhataBookRepository khataBookRepository;

    @Inject
    public DeleteKhataBookUseCase(KhataBookRepository khataBookRepository){
        this.khataBookRepository=khataBookRepository;
    }

    public Mono<DeleteKhataBookUseCaseResponse> execute(Integer id){
       return khataBookRepository.findById(id)
               .switchIfEmpty(Mono.error(new Throwable("Khatabook not available with provoded id")))
               .flatMap(khataBookEntity->khataBookRepository.deleteById(id))
               .then(Mono.just(new DeleteKhataBookUseCaseResponse("Deleted successfully")))
               .onErrorResume(err->Mono.error(new Throwable("Operation failed"+ err.getLocalizedMessage())));

    }
}
