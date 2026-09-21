package com.puff.tech.onboarding.usecase.userlogout;

import com.puff.tech.core.utils.JwtUtils;
import com.puff.tech.repository.UserRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.Date;

@Singleton
public class LogoutUserUseCase {

    private final UserRepository userRepository;

    @Inject
    public LogoutUserUseCase(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public Mono<LogoutUserUseCaseResponse> execute(String token){

        return Mono.justOrEmpty(token)
                .filter(userToken -> !userToken.isBlank())
                .switchIfEmpty(Mono.error(new RuntimeException("Unauthorized")))

                .flatMap(userToken ->
                        Mono.fromCallable(() -> {
                                    String jwt = userToken.replace("Bearer", "").trim();

                                    String userName = JwtUtils.extractSubjectFromToken(jwt);
                                    String role = JwtUtils.getClaims(jwt).get("permission", String.class);

                                    if (!"CUSTOMER".equalsIgnoreCase(role)) {
                                        throw new RuntimeException("Unauthorized");
                                    }

                                    return jwt; // pass JWT forward
                                })
                                .onErrorResume(err -> Mono.error(new RuntimeException(err.getMessage())))
                )

                .map(JwtUtils::getClaims)
                .filter(claims -> claims.getExpiration().after(new Date()))
                .filter(claims -> !JwtUtils.isTokenBlacklisted(claims.getId()))
                .map(claims -> {
                    JwtUtils.blacklistToken(token.replace("Bearer", "").trim());
                    return new LogoutUserUseCaseResponse("Logout successful");
                })

                .switchIfEmpty(Mono.error(new RuntimeException("Invalid or expired token")));
    }
}
