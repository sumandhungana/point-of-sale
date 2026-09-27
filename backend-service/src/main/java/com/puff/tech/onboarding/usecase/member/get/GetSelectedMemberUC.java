package com.puff.tech.onboarding.usecase.member.get;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.MemberRepository;
import com.puff.tech.onboarding.repository.UserMemberEntity;
import com.puff.tech.onboarding.repository.UserMemberRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Singleton
public class GetSelectedMemberUC implements MonoUC<GetSelectedMemberUCRequest, GetSelectedMemberUCResponse> {

    private final UserMemberRepository userMemberRepository;

    public GetSelectedMemberUC(UserMemberRepository userMemberRepository) {
        this.userMemberRepository = userMemberRepository;
    }

    @Override
    public Mono<GetSelectedMemberUCResponse> execute(GetSelectedMemberUCRequest request, UseCaseContext context) {
        var memberId = context.securityContext().memberId();
        var userId = Long.parseLong(context.securityContext().userId());
        return userMemberRepository.findByUserIdAndMemberId(userId, memberId)
                .map(this::toResponse)
                .switchIfEmpty(Mono.error(new Throwable("Member Not Found:: " + memberId)));
    }

    private GetSelectedMemberUCResponse toResponse(UserMemberEntity userMember) {
        return GetSelectedMemberUCResponse.builder()
                .id(Math.toIntExact(userMember.getMember().getId()))
                .organizationEmail(userMember.getMember().getOrganizationEmail())
                .branch(userMember.getMember().getBranch())
                .organizationName(userMember.getMember().getOrganizationName())
                .organizationAddress(userMember.getMember().getOrganizationAddress())
                .panVatNumber(userMember.getMember().getPanVatNumber())
                .createdAt(userMember.getMember().getCreatedAt())
                .updatedAt(userMember.getMember().getUpdatedAt())
                .updatedBy(userMember.getMember().getUpdatedBy())
                .createdBy(userMember.getMember().getCreatedBy())
                .organizationType(userMember.getMember().getOrganizationType())
                .build();

    }
}
