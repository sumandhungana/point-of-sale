package com.puff.tech.usermanagement.usecase.user.add;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.UserConvertor;
import com.puff.tech.repository.UserRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class AddUserUseCase implements UseCases<AddUserUseCaseRequest, AddUserUseCaseResponse> {

    private final UserRepository userRepository;

    @Inject
    public AddUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Mono<AddUserUseCaseResponse> execute(AddUserUseCaseRequest request) {
        var userEntity = UserConvertor.toEntity(request);
        return userRepository.findByUserName(request.userName())
                .flatMap(exists-> Mono.error(new Throwable("Username already taken")))
                .switchIfEmpty(userRepository.save(userEntity))
                .map(userData -> new AddUserUseCaseResponse("User added successfully", userEntity.getId()))
                .onErrorResume(err -> Mono.error(new Throwable("Unexpected happens while adding user" + err.getLocalizedMessage())));
    }
}
