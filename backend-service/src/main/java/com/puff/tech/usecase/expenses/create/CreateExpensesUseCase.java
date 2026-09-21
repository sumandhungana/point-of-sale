package com.puff.tech.usecase.expenses.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.core.utils.HelperUtils;
import com.puff.tech.covertor.ExpensesConvertor;
import com.puff.tech.repository.ExpensesRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateExpensesUseCase implements UseCases<CreateExpensesUseCaseRequest, CreateExpensesUseCaseResponse> {

    private final ExpensesRepository expensesRepository;
    private final KhataBookImplementation khataBookImplementation;
    private final HelperUtils helperUtils;

    @Inject
    public CreateExpensesUseCase(ExpensesRepository expensesRepository,
                                 KhataBookImplementation khataBookImplementation,
                                 HelperUtils helperUtils) {
        this.expensesRepository = expensesRepository;
        this.khataBookImplementation = khataBookImplementation;
        this.helperUtils = helperUtils;
    }

    @Override
    public Mono<CreateExpensesUseCaseResponse> execute(CreateExpensesUseCaseRequest request) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId -> {
                        var entity = ExpensesConvertor.toEntity(request, khataBookId);
                        return expensesRepository.save(entity)
                                .map(e -> new CreateExpensesUseCaseResponse("Created Successfully"))
                                .onErrorResume(err->Mono.error(new RuntimeException("Failed to create expense: " + err.getMessage())));
                    });
    }
}