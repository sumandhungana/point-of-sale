package com.puff.tech.usecase.transaction.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.TransactionConvertor;
import com.puff.tech.repository.TransactionRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateTransactionUseCase implements UseCases<UpdateTransactionUseCaseRequest,UpdateTransactionUseCaseResponse> {

    private final TransactionRepository transactionRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateTransactionUseCase(TransactionRepository transactionRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.transactionRepository = transactionRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateTransactionUseCaseResponse> execute(UpdateTransactionUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        transactionRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Transaction not found")))
                                .flatMap(transactionEntity -> {
                                    var updated= TransactionConvertor.toEntityUpdate(request,transactionEntity);
                                    return transactionRepository.update(updated)
                                            .map(saved->new UpdateTransactionUseCaseResponse("Transaction updated"))
                                            .onErrorResume(err->Mono.error(new RuntimeException(err.getLocalizedMessage())));
                                }));
    }
}
