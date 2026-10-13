package com.puff.tech.onboarding.usecase.getallorganization;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.onboarding.repository.MemberRepository;
import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.onboarding.repository.UserMemberRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Singleton
public class GetAllOrganizationUC implements FluxUC<GetAllOrganizationUCRequest, GetAllOrganizationUCResponse> {

    private final MemberRepository memberRepository;
    private final UserMemberRepository userMemberRepository;
    private final UserRoleRepository userRoleRepository;

    public GetAllOrganizationUC(MemberRepository memberRepository,
                                UserMemberRepository userMemberRepository,
                                UserRoleRepository userRoleRepository) {
        this.memberRepository = memberRepository;
        this.userMemberRepository = userMemberRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Flux<GetAllOrganizationUCResponse> execute(GetAllOrganizationUCRequest request, UseCaseContext context) {
        return memberRepository.findByRefMemberIdOrderByCreatedAtDesc(0L)
                .flatMapSequential(member ->
                        userMemberRepository.findByMemberId(member.getId())
                                .next()
                                .flatMap(userMember -> {
                                    UserInfoEntity user = userMember.getUser();
                                    if (user == null) {
                                        return Mono.just(toResponse(member, null, null));
                                    }
                                    if (user.getRole() != null) {
                                        try {
                                            Integer roleId = Integer.valueOf(user.getRole());
                                            return userRoleRepository.findById(roleId)
                                                    .map(role -> toResponse(member, user, role.getName()))
                                                    .defaultIfEmpty(toResponse(member, user, user.getRole()))
                                                    .onErrorResume(e -> Mono.just(toResponse(member, user, user.getRole())));
                                        } catch (Exception e) {
                                            return Mono.just(toResponse(member, user, user.getRole()));
                                        }
                                    }
                                    return Mono.just(toResponse(member, user, null));
                                })
                                .defaultIfEmpty(toResponse(member, null, null))
                                .onErrorResume(e -> Mono.just(toResponse(member, null, null)))
                )
                .onErrorResume(err -> Flux.error(new Throwable("Failed to fetch organizations:: " + err.getLocalizedMessage())));
    }

    private GetAllOrganizationUCResponse toResponse(MemberEntity member, UserInfoEntity user, String roleName) {
        Boolean isActive = true;
        Long userId = null;
        String userName = null;
        String userEmail = null;
        String roleId = null;

        if (user != null) {
            isActive = (user.getEnable() != null) ? user.getEnable() : true;
            userId = user.getId();
            userName = user.getUserName();
            userEmail = user.getEmail();
            roleId = user.getRole();
        }

        return GetAllOrganizationUCResponse.builder()
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
                .isActive(isActive)
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .roleId(roleId)
                .roleName(roleName)
                .build();
    }
}
