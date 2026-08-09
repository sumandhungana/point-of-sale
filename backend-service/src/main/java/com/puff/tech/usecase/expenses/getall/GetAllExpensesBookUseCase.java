package com.puff.tech.usecase.expenses.getall;

import com.puff.tech.covertor.ExpensesConvertor;
import com.puff.tech.covertor.KhataBookConvertor;
import com.puff.tech.repository.ExpensesRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllExpensesBookUseCase {

    private final KhataBookImplementation khataBookImplementation;
    private final ExpensesRepository expensesRepository;

    @Inject
    public GetAllExpensesBookUseCase(KhataBookImplementation khataBookImplementation,
                                     ExpensesRepository expensesRepository) {
        this.khataBookImplementation = khataBookImplementation;
        this.expensesRepository = expensesRepository;
    }

    public Flux<GetAllExpensesBookUseCaseResponse> execute(){
        Integer khataBookId= khataBookImplementation.getCurrentKhataBookId().block();
        return expensesRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                .map(ExpensesConvertor::response)
                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
