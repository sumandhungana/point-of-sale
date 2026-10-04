package com.puff.tech.usecase.cashbook.update;

import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateCashBookUseCase {


    public Mono<UpdateCashBookUseCaseResponse> execute(Integer id, UpdateCashBookUseCaseRequest request) {

        return null;
    }
}