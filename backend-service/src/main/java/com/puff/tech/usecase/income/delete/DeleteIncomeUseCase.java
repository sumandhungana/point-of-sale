package com.puff.tech.usecase.income.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.IncomeRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteIncomeUseCase implements UseCase<DeleteIncomeUseCaseRequest,DeleteIncomeUseCaseResponse> {

    private final IncomeRepository incomeRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteIncomeUseCase(IncomeRepository incomeRepository, KhataBookImplementation khataBookImplementation) {
        this.incomeRepository = incomeRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteIncomeUseCaseResponse> execute(DeleteIncomeUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        incomeRepository.findByIdAndKhataBookId(request.id(),khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Income not found")))
                                .flatMap(income->{
                                    return incomeRepository.deleteById(request.id())
                                            .then(Mono.just(new DeleteIncomeUseCaseResponse("Deleted successfully")));
                                }));
    }
}
