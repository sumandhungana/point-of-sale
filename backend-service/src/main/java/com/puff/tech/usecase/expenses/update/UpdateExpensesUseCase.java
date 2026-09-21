package com.puff.tech.usecase.expenses.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.core.utils.HelperUtils;
import com.puff.tech.covertor.ExpensesConvertor;
import com.puff.tech.entity.ExpensesEntity;
import com.puff.tech.repository.ExpensesRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateExpensesUseCase implements UseCases<UpdateExpensesUseCaseRequest, UpdateExpensesUseCaseResponse> {

    private final ExpensesRepository repository;
    private final KhataBookImplementation khataBookImplementation;
    private final HelperUtils helperUtils;

    public UpdateExpensesUseCase(ExpensesRepository repository,
                                 KhataBookImplementation khataBookImplementation,
                                 HelperUtils helperUtils) {
        this.repository = repository;
        this.khataBookImplementation = khataBookImplementation;
        this.helperUtils = helperUtils;
    }

    @Override
    public Mono<UpdateExpensesUseCaseResponse> execute(UpdateExpensesUseCaseRequest request) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->
                        repository.findByIdAndKhataBookId(request.id(),khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Expense not found")))
                                .flatMap(existing -> {
                                        ExpensesEntity updated = ExpensesConvertor.toEntityForUpdate(existing, request);
                                        return repository.update(updated)
                                                .map(e -> new UpdateExpensesUseCaseResponse("Updated Successfully"));
                                    })
                );

    }
}