package com.puff.tech.usecase.cashbook.create;

import com.puff.tech.repository.CashBookRepository;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Singleton
public class CreateCashBookUseCase {


    @Inject
    public CreateCashBookUseCase() {

    }

    public Mono<CreateCashBookUseCaseResponse> execute(CreateCashBookUseCaseRequest request) throws IOException {

        return null;
    }
}