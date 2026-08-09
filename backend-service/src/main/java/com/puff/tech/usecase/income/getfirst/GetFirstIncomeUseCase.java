package com.puff.tech.usecase.income.getfirst;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.IncomeConvertor;
import com.puff.tech.repository.IncomeRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.income.get.GetIncomeUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetFirstIncomeUseCase  {

    private final IncomeRepository incomeRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetFirstIncomeUseCase(IncomeRepository incomeRepository,
                                 KhataBookImplementation khataBookImplementation){
        this.incomeRepository=incomeRepository;
        this.khataBookImplementation=khataBookImplementation;
    }


    public Mono<GetIncomeUseCaseResponse> execute() {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        incomeRepository.findFirstByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(IncomeConvertor::getAllIncomeUseCaseResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err)))
                                );
    }
}
