package com.puff.tech.usermanagement.usecase.user.delete;

import com.puff.tech.repository.UserRepository;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

@Serdeable
public class DeleteUserUseCase {

    private final UserRepository userRepository;

    @Inject
    public DeleteUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Mono<DeleteUserUseCaseResponse> execute(Integer id) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new Throwable("User didnot found")))
                .flatMap(userEntity -> userRepository.deleteById(id)
                        .then(Mono.just(new DeleteUserUseCaseResponse("User deleteted successfully"))))
                .onErrorResume(err->Mono.error(new Throwable("Operation failed"+err.getLocalizedMessage())));
    }
}
