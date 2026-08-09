package com.puff.tech.usecase.transaction.get;

import com.puff.tech.covertor.TransactionConvertor;
import com.puff.tech.repository.TransactionRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetTransactionUseCase {

    private final TransactionRepository transactionRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetTransactionUseCase(TransactionRepository transactionRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.transactionRepository = transactionRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetTransactionUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId-> transactionRepository.findAllByKhataBookId(khataBookId)
                        .map(TransactionConvertor::toResponse)
                        .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
