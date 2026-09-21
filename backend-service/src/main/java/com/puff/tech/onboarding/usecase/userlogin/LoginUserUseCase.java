package com.puff.tech.onboarding.usecase.userlogin;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.utils.JwtUtils;
import com.puff.tech.core.utils.SecurityUtils;
import com.puff.tech.core.utils.JwtTokenInfo;
import com.puff.tech.onboarding.repository.*;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Singleton
public class LoginUserUseCase implements MonoUC<LoginUserUseCaseRequest,LoginUserUseCaseResponse> {

    private final UserInfoRepository userInfoRepository;
    private final UserMemberRepository userMemberRepository;

    public LoginUserUseCase(UserInfoRepository userInfoRepository,
                            UserMemberRepository userMemberRepository){
        this.userInfoRepository = userInfoRepository;
        this.userMemberRepository = userMemberRepository;
    }

    @Override
    public Mono<LoginUserUseCaseResponse> execute(LoginUserUseCaseRequest request, UseCaseContext context) {
        return userInfoRepository.findByUserId(request.username())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid username")))
                .filter(userInfoEntity -> SecurityUtils.verifyPassword(request.password(), userInfoEntity.getPassword()))
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid password")))
                .flatMap(userInfoEntity ->
                        // Fetch user's member/organization details
                        Mono.from(userMemberRepository.findByUser(userInfoEntity))
                                .map(UserMemberEntity::getMember)
                                .defaultIfEmpty(new MemberEntity()) // Fallback in case user has no organization linked
                                .map(member -> mapToResponse(userInfoEntity, member))
                );
    }

    private LoginUserUseCaseResponse mapToResponse(UserInfoEntity user, MemberEntity member) {
        String memberId = Objects.nonNull(member) ? member.getMemberId() : null;
        String orgName = Objects.nonNull(member) ? member.getOrganizationName() : null;

        return new LoginUserUseCaseResponse(
                JwtUtils.generateToken(prepareJwtTokenInfo(user, memberId)),
                "Success Authenticate",
                LoginUserUseCaseResponse.UserInfo.builder()
                        .id(user.getId())
                        .userId(user.getUserId())
                        .userName(user.getUserName())
                        .email(user.getGmail())
                        .memberId(memberId)
                        .organizationName(orgName)
                        .role(user.getRole())
                        .permission(user.getPermission())
                        .enabled(user.getEnable())
                        .build()
        );
    }

    private static JwtTokenInfo prepareJwtTokenInfo(UserInfoEntity userInfo, String memberId) {
        return new JwtTokenInfo(
                userInfo.getUserId(),
                userInfo.getUserId(),
                userInfo.getUserName(),
                userInfo.getRole(),
                userInfo.getPermission(),
                userInfo.getEnable(),
                memberId // Pass memberId into JWT payload
        );
    }
}
