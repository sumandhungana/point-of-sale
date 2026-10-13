
package com.puff.tech.onboarding.usecase.registration;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.utils.JsonUtils;
import com.puff.tech.onboarding.repository.*;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.security.UserSecurityContext;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.util.Objects;
import java.util.Optional;

import static com.puff.tech.core.utils.SecurityUtils.hashPassword;

@Singleton
public class UserRegistrationUseCase implements MonoUC<UserRegistrationUcRequest, UserRegistrationUcResponse> {

    private static final Logger LOG = LoggerFactory.getLogger(UserRegistrationUseCase.class);
    private final UserInfoRepository userInfoRepository;
    private final MemberRepository memberRepository;
    private final UserMemberRepository userMemberRepository;
    private final UserRoleRepository userRoleRepository;
    private static final String DEFAULT_SELF_ONBOARDING_ROLE = "";
    private static final String SELF_ONBOARDING = "SELF_ONBOARDING";

    public UserRegistrationUseCase(UserInfoRepository userInfoRepository,
                                   MemberRepository memberRepository,
                                   UserMemberRepository userMemberRepository,
                                   UserRoleRepository userRoleRepository) {
        this.userInfoRepository = userInfoRepository;
        this.memberRepository = memberRepository;
        this.userMemberRepository = userMemberRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Mono<UserRegistrationUcResponse> execute(UserRegistrationUcRequest request, UseCaseContext context) {
        String createdBy = Optional.ofNullable(context)
                .map(UseCaseContext::securityContext)
                .map(UserSecurityContext::subject)
                .filter(subject -> !subject.isBlank())
                .orElse(SELF_ONBOARDING);

        Long refMemberId = Optional.ofNullable(context)
                .map(UseCaseContext::securityContext)
                .map(UserSecurityContext::memberId)
                .orElse(null);

        return Mono.justOrEmpty(request)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Request payload cannot be empty")))
                .filter(req -> Objects.nonNull(req.gmail()) && !req.gmail().isBlank())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Email/Gmail is required for registration")))
                .flatMap(validReq -> {

                    // Step 0: Handle External vs Internal Onboarding flow
                    Mono<UserInfoEntity> saveUserMono;

                    if (validReq.isExternalOnboarding()) {
                        // External onboarding: skip role fetching and save with empty role/permissions
                        UserInfoEntity userEntity = mapToUserEntity(validReq, null, createdBy);
                        saveUserMono = Mono.from(userInfoRepository.save(userEntity));
                    } else {
                        if (validReq.role() == null || validReq.role().isBlank()) {
                            return Mono.error(new IllegalArgumentException("Role is required when internal onboarding (isExternalOnboarding is false)"));
                        }

                        // Internal onboarding: fetch role entity dynamically
                        saveUserMono = userRoleRepository.findById(Integer.valueOf(validReq.role()))
                                .switchIfEmpty(Mono.error(new IllegalStateException("Role '" + validReq.role() + "' not found in database")))
                                .flatMap(role -> Mono.from(userInfoRepository.save(mapToUserEntity(validReq, role, createdBy))));
                    }

                    // Proceed with User save, Member creation, and linking
                    return saveUserMono
                            .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save user credentials")))
                            .flatMap(savedUser ->
                                    memberRepository.getNextMemberSequence()
                                            .defaultIfEmpty(1L)
                                            .flatMap(nextSeq -> {
                                                MemberEntity member = mapToMemberEntity(validReq);
                                                if (!validReq.isExternalOnboarding() && validReq.isSelfOrganizationOnboarded())
                                                    member.setRefMemberId(refMemberId);
                                                else
                                                    member.setRefMemberId(0L);
                                                return Mono.from(memberRepository.save(member));
                                            })
                                            .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save organization details")))
                                            .flatMap(savedMember ->
                                                    Mono.from(userMemberRepository.save(mapToUserMemberEntity(savedUser, savedMember)))
                                                            .switchIfEmpty(Mono.error(new IllegalStateException("Failed to link user to organization")))
                                                            .map(userMember -> mapToResponse(savedUser, savedMember))
                                            )
                            );
                })
                .doOnError(err -> LOG.error("User registration failed for email {}: ", request != null ? request.gmail() : "N/A", err))
                .onErrorResume(Mono::error);
    }

    private UserInfoEntity mapToUserEntity(UserRegistrationUcRequest request, UserRoleEntity roleEntity, String createdBy) {
        UserInfoEntity user = new UserInfoEntity();
        user.setUserName(request.userName());
        user.setUserId(request.userId());
        user.setPassword(hashPassword(request.password()));
        user.setPhoneNumber(request.phoneNumber());
        user.setEmail(request.gmail());

        // Safe extraction of permission ID to prevent NoSuchElementException
        if (roleEntity != null && roleEntity.getPermissions() != null && !roleEntity.getPermissions().isEmpty()) {
            String permissionIds = JsonUtils.toJsonString(
                    roleEntity.getPermissions()
                            .stream()
                            .map(UserPermissionEntity::getId)
                            .toList()
            );
            user.setRole(String.valueOf(roleEntity.getId()));
            user.setPermission(permissionIds);
        } else {
            user.setRole("");
            user.setPermission("");
        }
        user.setUpdatedBy("System");
        if(request.isExternalOnboarding()) {
            user.setCreatedBy(createdBy);
            user.setEnable(false);
        }
        else {
            user.setCreatedBy(createdBy);
            user.setEnable(true);
        }
        return user;
    }

    private MemberEntity mapToMemberEntity(UserRegistrationUcRequest request) {
        MemberEntity member = new MemberEntity();
        member.setOrganizationName(request.organizationName());
        member.setPanVatNumber(request.panVatNumber());
        member.setOrganizationType(request.organizationType());
        member.setBranch(request.branch());
        member.setOrganizationAddress(request.organizationAddress());
        member.setNotes(request.notes());
        member.setUpdatedBy("System");
        member.setCreatedBy("System");
        return member;
    }

    private UserMemberEntity mapToUserMemberEntity(UserInfoEntity user, MemberEntity member) {
        UserMemberEntity userMember = new UserMemberEntity();
        userMember.setUser(user);
        userMember.setMember(member);
        userMember.setCreatedBy("System");
        return userMember;
    }

    private UserRegistrationUcResponse mapToResponse(UserInfoEntity user, MemberEntity member) {
        return UserRegistrationUcResponse.success(
                user.getId(),
                user.getEmail(),
                user.getUserName(),
                member.getOrganizationName(),
                String.valueOf(member.getId())
        );
    }
}