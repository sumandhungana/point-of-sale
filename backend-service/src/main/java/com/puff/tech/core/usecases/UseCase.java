package com.puff.tech.core.usecases;

import com.puff.tech.security.SecurityContextHolder;
import com.puff.tech.security.UseCaseContext;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Mono;


@FunctionalInterface
public interface UseCase<I extends UseCase.UseCaseRequest, O extends UseCase.UseCaseResponse> {

    interface UseCaseRequest {}
    interface UseCaseResponse {}

//    // Core method implemented by your use cases
//    Mono<O> execute(I request, UseCaseContext context);
//
//    // Default overload that automatically injects UseCaseContext from Reactor context
//    default Mono<O> execute(I request) {
//        return SecurityContextHolder.getUseCaseContext()
//                .flatMap(context -> execute(request, context));
//    }
Publisher<O> execute(I request, UseCaseContext context);

    default Publisher<O> execute(I request) {
        return SecurityContextHolder.getUseCaseContext()
                .flatMapMany(context -> execute(request, context));
    }
}