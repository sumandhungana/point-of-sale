package com.puff.tech.usecase.income.get;

import com.puff.tech.covertor.IncomeConvertor;
import com.puff.tech.repository.IncomeRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllIncomeUseCase{
    private final IncomeRepository incomeRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetAllIncomeUseCase(IncomeRepository incomeRepository,
                               KhataBookImplementation khataBookImplementation) {
        this.incomeRepository = incomeRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetIncomeUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        incomeRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(IncomeConvertor::getAllIncomeUseCaseResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err)))
                );
    }
}
