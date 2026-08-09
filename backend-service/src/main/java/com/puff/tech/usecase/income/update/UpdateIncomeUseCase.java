package com.puff.tech.usecase.income.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.IncomeConvertor;
import com.puff.tech.repository.IncomeRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateIncomeUseCase implements UseCase<UpdateIncomeUseCaseRequest,UpdateIncomeUseCaseResponse> {

    private final IncomeRepository incomeRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateIncomeUseCase(IncomeRepository incomeRepository,
                               KhataBookImplementation khataBookImplementation) {
        this.incomeRepository = incomeRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateIncomeUseCaseResponse> execute(UpdateIncomeUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        incomeRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Income not found")))
                                .flatMap(existing->{
                                    var updated= IncomeConvertor.toUpdateEntity(existing,request);
                                    return incomeRepository.update(updated)
                                            .map(income->new UpdateIncomeUseCaseResponse("Income updated successfully"));
                                        }
                                        ));
    }
}
