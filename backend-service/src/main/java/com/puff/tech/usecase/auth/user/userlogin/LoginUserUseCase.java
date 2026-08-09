package com.puff.tech.usecase.auth.user.userlogin;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.core.utils.JwtUtils;
import com.puff.tech.core.utils.SecurityUtils;
import com.puff.tech.repository.UserRepository;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class LoginUserUseCase implements UseCase<LoginUserUseCaseRequest,LoginUserUseCaseResponse> {

    private final UserRepository userRepository;

    public LoginUserUseCase(UserRepository userRepository){
        this.userRepository=userRepository;
    }

    @Override
    public Mono<LoginUserUseCaseResponse> execute(LoginUserUseCaseRequest request) {
        return userRepository.findByUserName(request.userName())
                .switchIfEmpty(Mono.error(new Throwable("Invalid username")))
                .filter(userEntity -> SecurityUtils.verifyPassword(request.password(),userEntity.getPasswordHash()))
                .switchIfEmpty(Mono.error(new Throwable("Invalid password")))
                .flatMap(userEntity ->
                        Mono.just(new LoginUserUseCaseResponse(
                                JwtUtils.generateToken(request.userName(),userEntity.getPermission()),
                                "Success Authenticate",
                                new String[]{userEntity.getPermission()},
                                userEntity.getUserName()
                        )));
    }
}
