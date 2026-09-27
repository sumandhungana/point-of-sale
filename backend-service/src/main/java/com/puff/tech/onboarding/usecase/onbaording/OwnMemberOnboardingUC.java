package com.puff.tech.onboarding.usecase.onbaording;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.*;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class OwnMemberOnboardingUC implements MonoUC<OwnMemberOnboardingUCRequest, OwnMemberOnboardingUCResponse> {

    private final UserMemberRepository userMemberRepository;
    private final MemberRepository memberRepository;


    public OwnMemberOnboardingUC(UserMemberRepository userMemberRepository,
                                 MemberRepository memberRepository) {
        this.userMemberRepository = userMemberRepository;
        this.memberRepository = memberRepository;
    }


    @Override
    public Mono<OwnMemberOnboardingUCResponse> execute(OwnMemberOnboardingUCRequest request, UseCaseContext context) {
        String userId = context.securityContext().userId();
        Long refMemberId = context.securityContext().memberId();
        String createdBy = context.securityContext().subject();
        MemberEntity member = this.prepareMemberEntity(request, userId, refMemberId, createdBy);
        return Mono.from(memberRepository.save(member))
                .flatMap(savedMember -> {
                    UserMemberEntity userMemberEntity = this.prepareUserMemberEntity(userId, savedMember, createdBy);
                    return Mono.from(userMemberRepository.save(userMemberEntity))
                            .map(savedUserMember -> new OwnMemberOnboardingUCResponse(
                                    savedMember.getId(),
                                    "User Own Member onboarded successfully"
                            ));
                });
    }

    private MemberEntity prepareMemberEntity(OwnMemberOnboardingUCRequest request, String userId, Long refMemberId, String createdBy) {
        MemberEntity member = new MemberEntity();
        member.setRefMemberId(refMemberId);
        member.setOrganizationName(request.organizationName());
        member.setOrganizationAddress(request.organizationAddress());
        member.setOrganizationName(request.organizationName());
        member.setOrganizationType(request.organizationType());
        member.setOrganizationContactNumber(request.organizationPhoneNumber());
        member.setOrganizationEmail(request.organizationEmail());
        member.setPanVatNumber(request.panVatNumber());
        member.setNotes(request.notes());
        member.setBranch(request.branch());
        member.setCreatedBy(createdBy);
        return member;
    }

    private UserMemberEntity prepareUserMemberEntity(String userId, MemberEntity member, String createdBy)  {
        UserMemberEntity userMemberEntity = new UserMemberEntity();
        if(userId != null) {
            UserInfoEntity userInfoEntity = new UserInfoEntity();
            userInfoEntity.setId(Long.valueOf(userId));
            userMemberEntity.setUser(userInfoEntity);
        }
        userMemberEntity.setMember(member);
        userMemberEntity.setCreatedBy(createdBy);
        return userMemberEntity;
    }
}
