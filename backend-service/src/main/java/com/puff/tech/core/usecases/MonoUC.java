package com.puff.tech.core.usecases;

import com.puff.tech.security.SecurityContextHolder;
import com.puff.tech.security.UseCaseContext;
import reactor.core.publisher.Mono;

public interface MonoUC<
        I extends UCRequest,
        O extends UCResponse> {

    Mono<O> execute(I request, UseCaseContext context);

    default Mono<O> execute(I request) {
        return SecurityContextHolder.getUseCaseContext()
                .flatMap(context -> execute(request, context));
    }
}
