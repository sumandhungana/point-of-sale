package com.puff.tech.usermanagement.usecase.userlogin;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.core.utils.JwtUtils;
import com.puff.tech.core.utils.SecurityUtils;
import com.puff.tech.core.utils.JwtTokenInfo;
import com.puff.tech.usermanagement.repository.UserInfoEntity;
import com.puff.tech.usermanagement.repository.UserInfoRepository;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class LoginUserUseCase implements UseCases<LoginUserUseCaseRequest,LoginUserUseCaseResponse> {

    private final UserInfoRepository userInfoRepository;

    public LoginUserUseCase(UserInfoRepository userInfoRepository){
        this.userInfoRepository = userInfoRepository;
    }

    @Override
    public Mono<LoginUserUseCaseResponse> execute(LoginUserUseCaseRequest request) {
        return userInfoRepository.findByUsername(request.username())
                .switchIfEmpty(Mono.error(new Throwable("Invalid username")))
                .filter(userInfoEntity -> SecurityUtils.verifyPassword(request.password(),userInfoEntity.getPassword()))
                .switchIfEmpty(Mono.error(new Throwable("Invalid password")))
                .flatMap(userInfoEntity  -> Mono.just(mapToResponse(userInfoEntity)));
    }

    private LoginUserUseCaseResponse mapToResponse(UserInfoEntity user) {
        return new LoginUserUseCaseResponse(
                JwtUtils.generateToken(prepareJwtTokenInfo(user)),
                "Success Authenticate",
                new LoginUserUseCaseResponse.UserInfo(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        false,
                        true,
                        null,
                        null,
                        null
                )
        );
    }

    private static JwtTokenInfo prepareJwtTokenInfo(UserInfoEntity userInfo) {
        return new JwtTokenInfo(userInfo.getUserId(),
                userInfo.getUserId(),
                userInfo.getUsername(),
                userInfo.getRole(),
                userInfo.getPermission(),
                userInfo.getEnable());
    }
}
