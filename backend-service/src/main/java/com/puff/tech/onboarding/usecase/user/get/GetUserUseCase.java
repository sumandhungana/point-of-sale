package com.puff.tech.usermanagement.usecase.user.get;


import com.puff.tech.covertor.UserConvertor;
import com.puff.tech.repository.UserRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetUserUseCase {

    private final UserRepository userRepository;

    @Inject
    public GetUserUseCase(UserRepository userRepository){
        this.userRepository=userRepository;
    }

    public Flux<GetUserUseCaseResponse> execute(){
        return userRepository.findAll()
                .map(UserConvertor::toGetUsers)
                .onErrorResume(err->Flux.error(new Throwable("Cannot fetch user" +err.getLocalizedMessage())));
    }
}
