package com.puff.tech.usecase.transaction.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.TransactionConvertor;
import com.puff.tech.repository.TransactionRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateTransactionUseCase implements UseCases<CreateTransactionUseCaseRequest,CreateTransactionUseCaseResponse> {

    private final TransactionRepository transactionRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateTransactionUseCase(TransactionRepository transactionRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.transactionRepository = transactionRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateTransactionUseCaseResponse> execute(CreateTransactionUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var transaction= TransactionConvertor.toEntity(request,khataBookId);
                    return transactionRepository.save(transaction)
                            .map(saved->new CreateTransactionUseCaseResponse("Transaction created"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                });
    }
}
