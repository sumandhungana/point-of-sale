package com.puff.tech.core.usecases;

import com.puff.tech.security.SecurityContextHolder;
import com.puff.tech.security.UseCaseContext;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface FluxUC<
        I extends UCRequest,
        O extends UCResponse> {

    Flux<O> execute(I request, UseCaseContext context);

    default Flux<O> execute(I request) {
        return SecurityContextHolder.getUseCaseContext()
                .flatMapMany(context -> execute(request, context));
    }
}
