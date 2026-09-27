package com.puff.tech.onboarding.usecase.userlogout;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class LogoutUserUseCase implements MonoUC<LogoutUserUseCaseRequest, LogoutUserUseCaseResponse> {

    public LogoutUserUseCase() {
    }

    @Override
    public Mono<LogoutUserUseCaseResponse> execute(LogoutUserUseCaseRequest request, UseCaseContext context) {
        if (context == null || !context.isAuthenticated()) {
            return Mono.error(new IllegalStateException("User is not authenticated"));
        }

        // Purely stateless: Client handles token deletion from local storage/cookies
        return Mono.just(new LogoutUserUseCaseResponse("Logged out successfully"));
    }
}
