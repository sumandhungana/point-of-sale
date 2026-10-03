package com.puff.tech.onboarding.usecase.user.get;


import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.covertor.UserConvertor;
import com.puff.tech.onboarding.repository.UserInfoRepository;
import com.puff.tech.onboarding.repository.UserMemberRepository;
import com.puff.tech.repository.UserRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetUserUseCase implements FluxUC<GetUserUCRequest, GetUserUseCaseResponse> {

    private final UserInfoRepository userRepository;
    private final UserMemberRepository userMemberRepository;

    public GetUserUseCase(UserInfoRepository userRepository,
                          UserMemberRepository userMemberRepository){
        this.userRepository=userRepository;
        this.userMemberRepository = userMemberRepository;
    }

    @Override
    public Flux<GetUserUseCaseResponse> execute(GetUserUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return Flux.from(userMemberRepository.findByMemberId(memberId))
                .map(userMember -> UserConvertor.toGetUsers(userMember.getUser()))
                .onErrorResume(err -> Flux.error(
                        new Throwable("Cannot fetch user: " + err.getMessage(), err)
                ));
    }
}
