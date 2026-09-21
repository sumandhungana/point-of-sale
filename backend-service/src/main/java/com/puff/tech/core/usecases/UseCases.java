package com.puff.tech.core.usecases;

import reactor.core.publisher.Mono;

@FunctionalInterface
public interface UseCases<I extends UseCases.UseCaseRequest, O extends UseCases.UseCaseResponse> {

   interface UseCaseRequest{

   }
   interface UseCaseResponse{

   }

    Mono<O> execute(I request);
}
