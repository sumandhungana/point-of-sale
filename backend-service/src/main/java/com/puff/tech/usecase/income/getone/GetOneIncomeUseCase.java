package com.puff.tech.usecase.income.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.IncomeConvertor;
import com.puff.tech.repository.IncomeRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.income.get.GetIncomeUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneIncomeUseCase implements UseCase<GetOneIncomeUseCaseRequest, GetIncomeUseCaseResponse> {

    private final IncomeRepository incomeRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneIncomeUseCase(IncomeRepository incomeRepository,
                                 KhataBookImplementation khataBookImplementation){
        this.incomeRepository=incomeRepository;
        this.khataBookImplementation=khataBookImplementation;
    }

    @Override
    public Mono<GetIncomeUseCaseResponse> execute(GetOneIncomeUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        incomeRepository.findByIdAndKhataBookId(request.id(),khataBookId)
                                .map(IncomeConvertor::getAllIncomeUseCaseResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err)))
                );
    }
}
