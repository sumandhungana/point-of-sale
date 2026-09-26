package com.puff.tech.onboarding.usecase.user.get;


import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.covertor.UserConvertor;
import com.puff.tech.onboarding.repository.UserInfoRepository;
import com.puff.tech.repository.UserRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetUserUseCase implements FluxUC<GetUserUCRequest, GetUserUseCaseResponse> {

    private final UserInfoRepository userRepository;

    @Inject
    public GetUserUseCase(UserInfoRepository userRepository){
        this.userRepository=userRepository;
    }

    @Override
    public Flux<GetUserUseCaseResponse> execute(GetUserUCRequest request, UseCaseContext context) {
        return Flux.from(userRepository.findAll())
                .map(UserConvertor::toGetUsers)
                .onErrorResume(err -> Flux.error(
                        new Throwable("Cannot fetch user: " + err.getMessage(), err)
                ));
    }
}
