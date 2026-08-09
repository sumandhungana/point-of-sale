package com.puff.tech.usecase.transaction.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.TransactionConvertor;
import com.puff.tech.repository.TransactionRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.transaction.get.GetTransactionUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneTransactionUseCase implements UseCase<GetOneTransactionUseCaseRequest, GetTransactionUseCaseResponse> {

    private final TransactionRepository transactionRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneTransactionUseCase(TransactionRepository transactionRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.transactionRepository = transactionRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetTransactionUseCaseResponse> execute(GetOneTransactionUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        transactionRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(TransactionConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
