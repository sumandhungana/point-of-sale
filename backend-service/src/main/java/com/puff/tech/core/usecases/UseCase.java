package com.puff.tech.core.usecases;

import reactor.core.publisher.Mono;

@FunctionalInterface
public interface UseCase<I extends UseCase.UseCaseRequest, O extends UseCase.UseCaseResponse> {

   interface UseCaseRequest{

   }
   interface UseCaseResponse{

   }

    Mono<O> execute(I request);
}
