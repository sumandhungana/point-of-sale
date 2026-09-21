package com.puff.tech.usecase.income.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.IncomeConvertor;
import com.puff.tech.repository.IncomeRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateIncomeUseCase implements UseCases<CreateIncomeUseCaseRequest,CreateIncomeUseCaseResponse> {

    private final IncomeRepository incomeRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateIncomeUseCase(IncomeRepository incomeRepository,
                               KhataBookImplementation khataBookImplementation) {
        this.incomeRepository = incomeRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateIncomeUseCaseResponse> execute(CreateIncomeUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                      var income= IncomeConvertor.toEntity(request,khataBookId);
                      return incomeRepository.save(income)
                              .map(incomeEntity -> new CreateIncomeUseCaseResponse("Income created"))
                              .onErrorResume(err->Mono.error(new RuntimeException(err.getLocalizedMessage())));

                });
    }
}
