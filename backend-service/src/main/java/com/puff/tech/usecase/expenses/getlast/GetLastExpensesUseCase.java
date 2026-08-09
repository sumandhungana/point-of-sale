package com.puff.tech.usecase.expenses.getlast;

import com.puff.tech.covertor.ExpensesConvertor;
import com.puff.tech.repository.ExpensesRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.expenses.getall.GetAllExpensesBookUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetLastExpensesUseCase {

    private final ExpensesRepository expensesRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetLastExpensesUseCase(ExpensesRepository expensesRepository,
                                  KhataBookImplementation khataBookImplementation) {
        this.expensesRepository = expensesRepository;
        this.khataBookImplementation = khataBookImplementation;
    }
    public Mono<GetAllExpensesBookUseCaseResponse> execute(){
        Integer khataBookId= khataBookImplementation.getCurrentKhataBookId().block();
        return expensesRepository.findLatestExpense(khataBookId)
                .map(ExpensesConvertor::response)
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
