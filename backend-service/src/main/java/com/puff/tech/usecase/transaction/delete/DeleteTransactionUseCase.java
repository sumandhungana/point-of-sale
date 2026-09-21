package com.puff.tech.usecase.transaction.delete;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.repository.TransactionRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteTransactionUseCase implements UseCases<DeleteTransactionUseCaseRequest,DeleteTransactionUseCaseResponse> {

    private final TransactionRepository transactionRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteTransactionUseCase(TransactionRepository transactionRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.transactionRepository = transactionRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteTransactionUseCaseResponse> execute(DeleteTransactionUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId-> transactionRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Transaction not found")))
                        .flatMap(transactionEntity ->
                                transactionRepository.deleteById(request.id())
                                        .then(Mono.just(new DeleteTransactionUseCaseResponse("Transaction deleted successfully")))));
    }
}
