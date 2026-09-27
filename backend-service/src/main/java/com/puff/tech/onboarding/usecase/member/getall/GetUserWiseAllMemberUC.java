package com.puff.tech.onboarding.usecase.member.getall;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.onboarding.repository.MemberRepository;
import com.puff.tech.onboarding.repository.UserMemberRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

import java.util.Objects;

@Singleton
public class GetUserWiseAllMemberUC implements FluxUC<GetUserWiseAllMemberUCRequest, GetUserWiseAllMemberUCResponse> {

    private final MemberRepository memberRepository;
    private final UserMemberRepository userMemberRepository;

    @Inject
    public GetUserWiseAllMemberUC(MemberRepository memberRepository, UserMemberRepository userMemberRepository) {
        this.memberRepository = memberRepository;
        this.userMemberRepository = userMemberRepository;
    }

    @Override
    public Flux<GetUserWiseAllMemberUCResponse> execute(GetUserWiseAllMemberUCRequest request, UseCaseContext context) {
        Long userId =Long.parseLong(context.securityContext().userId());
        return userMemberRepository.findByUserId(userId)
                .filter(um -> Objects.nonNull(um.getMember()))
                .map(um -> um.getMember().getId())
                .filter(Objects::nonNull)
                .collectList()
                .flatMapMany(memberIds -> {
                    if (memberIds.isEmpty()) {
                        return Flux.empty();
                    }
                    return Flux.from(memberRepository.findByIdIn(memberIds));
                })
                .map(this::toResponse)
                .onErrorResume(err -> Flux.error(new Throwable("Failed to fetch members: " + err.getLocalizedMessage())));
    }

    private GetUserWiseAllMemberUCResponse toResponse(MemberEntity member) {
        return GetUserWiseAllMemberUCResponse.builder()
                .id(member.getId())
                .referenceMemberId(member.getRefMemberId())
                .organizationName(member.getOrganizationName())
                .panVatNumber(member.getPanVatNumber())
                .organizationType(member.getOrganizationType())
                .branch(member.getBranch())
                .organizationAddress(member.getOrganizationAddress())
                .organizationEmail(member.getOrganizationEmail())
                .organizationContactNumber(member.getOrganizationContactNumber())
                .notes(member.getNotes())
                .createdAt(member.getCreatedAt())
                .createdBy(member.getCreatedBy())
                .updatedAt(member.getUpdatedAt())
                .updatedBy(member.getUpdatedBy())
                .build();

    }
}
