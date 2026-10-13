package com.puff.tech.onboarding.usecase.user.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.covertor.UserConvertor;
import com.puff.tech.onboarding.repository.UserMemberRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

import java.util.Objects;
import java.util.Optional;

@Singleton
public class GetUserUseCase implements FluxUC<GetUserUCRequest, GetUserUCResponse> {

    private final UserMemberRepository userMemberRepository;

    public GetUserUseCase(UserMemberRepository userMemberRepository) {
        this.userMemberRepository = userMemberRepository;
    }

    @Override
    public Flux<GetUserUCResponse> execute(GetUserUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        if (memberId == null) {
            return Flux.error(new IllegalArgumentException("Member ID is required to fetch users"));
        }

        return userMemberRepository.findByMemberId(memberId)
                .map(userMember -> UserConvertor.toGetUsers(userMember.getUser()))
                .filter(Objects::nonNull)
                .onErrorResume(err -> Flux.error(
                        new Throwable("Cannot fetch user: " + err.getMessage(), err)
                ));
    }
}
