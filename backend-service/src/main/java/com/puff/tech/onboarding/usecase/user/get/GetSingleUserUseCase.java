package com.puff.tech.onboarding.usecase.user.get;

import com.puff.tech.covertor.UserConvertor;
import com.puff.tech.repository.UserRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetSingleUserUseCase {

    private final UserRepository userRepository;

    @Inject
    public GetSingleUserUseCase(UserRepository userRepository){
        this.userRepository=userRepository;
    }

    public Mono<GetUserUseCaseResponse> execute(Integer id){
//        return userRepository.findById(id)
//                .map(UserConvertor::toGetUsers)
//                .onErrorResume(err-> Mono.error(new Throwable("Cannot fetch user" +err.getLocalizedMessage())));
        return null;
    }
}
