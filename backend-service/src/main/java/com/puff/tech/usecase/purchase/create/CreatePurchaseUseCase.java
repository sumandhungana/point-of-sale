package com.puff.tech.usecase.purchase.create;

import com.puff.tech.core.usecases.UseCases;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreatePurchaseUseCase implements UseCases<CreatePurchaseUseCaseRequest, CreatePurchaseUseCaseResponse> {


    @Override
    public Mono<CreatePurchaseUseCaseResponse> execute(CreatePurchaseUseCaseRequest request) {
        return null;


    }
}
