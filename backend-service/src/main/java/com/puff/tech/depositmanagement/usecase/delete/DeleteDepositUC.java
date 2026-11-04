package com.puff.tech.depositmanagement.usecase.delete;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.depositmanagement.repository.DepositRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteDepositUC implements MonoUC<DeleteDepositUCRequest, DeleteDepositUCResponse> {

    private final DepositRepository depositRepository;

    public DeleteDepositUC(DepositRepository depositRepository) {
        this.depositRepository = depositRepository;
    }

    @Override
    public Mono<DeleteDepositUCResponse> execute(DeleteDepositUCRequest request, UseCaseContext context) {
        return depositRepository.findById(request.id())
                .switchIfEmpty(Mono.error(new Throwable("Deposit did not found")))
                .flatMap(deposit ->
                        depositRepository.deleteById(request.id()))
                .map(response-> new DeleteDepositUCResponse("Deposit deleted successfully"))
                .onErrorResume(err-> Mono.error(new RuntimeException("Failed to delete deposit:: " +err.getLocalizedMessage())));
    }
}
