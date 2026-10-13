package com.puff.tech.onboarding.usecase.user.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.utils.JsonUtils;
import com.puff.tech.core.utils.SecurityUtils;
import com.puff.tech.onboarding.repository.*;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.security.UserSecurityContext;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Singleton
public class AddUserUC implements MonoUC<AddUserUCRequest, AddUserUCResponse> {

    private static final Logger LOG = LoggerFactory.getLogger(AddUserUC.class);

    private final UserInfoRepository userInfoRepository;
    private final MemberRepository memberRepository;
    private final UserMemberRepository userMemberRepository;
    private final UserRoleRepository userRoleRepository;

    public AddUserUC(UserInfoRepository userInfoRepository,
                     MemberRepository memberRepository,
                     UserMemberRepository userMemberRepository,
                     UserRoleRepository userRoleRepository) {
        this.userInfoRepository = userInfoRepository;
        this.memberRepository = memberRepository;
        this.userMemberRepository = userMemberRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    @Transactional
    public Mono<AddUserUCResponse> execute(AddUserUCRequest request, UseCaseContext context) {
        String createdBy = Optional.ofNullable(context)
                .map(UseCaseContext::securityContext)
                .map(UserSecurityContext::subject)
                .filter(subject -> !subject.isBlank())
                .orElse("SYSTEM");

        Long contextMemberId = Optional.ofNullable(context)
                .map(UseCaseContext::securityContext)
                .map(UserSecurityContext::memberId)
                .orElse(null);

        return Mono.justOrEmpty(request)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Request payload cannot be empty")))
                .filter(req -> req.userName() != null && !req.userName().isBlank())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Username is required")))
                .filter(req -> req.email() != null && !req.email().isBlank())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Email is required")))
                .filter(req -> req.password() != null && !req.password().isBlank())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Password is required")))
                .flatMap(validReq -> {
                    Long targetMemberId = validReq.memberId() != null ? validReq.memberId() : contextMemberId;
                    if (targetMemberId == null) {
                        return Mono.error(new IllegalArgumentException("Member ID is required to enroll user"));
                    }

                    // 1. Verify Member exists
                    return Mono.from(memberRepository.findById(targetMemberId))
                            .switchIfEmpty(Mono.error(new IllegalArgumentException("Organization / Member not found with id: " + targetMemberId)))
                            .flatMap(member -> {
                                // 2. Resolve Role
                                Mono<UserRoleEntity> roleMono;
                                if (validReq.role() != null && !validReq.role().isBlank()) {
                                    try {
                                        Integer roleId = Integer.valueOf(validReq.role());
                                        roleMono = userRoleRepository.findById(roleId)
                                                .switchIfEmpty(userRoleRepository.findByName(validReq.role()))
                                                .defaultIfEmpty(new UserRoleEntity());
                                    } catch (NumberFormatException e) {
                                        roleMono = userRoleRepository.findByName(validReq.role())
                                                .defaultIfEmpty(new UserRoleEntity());
                                    }
                                } else {
                                    roleMono = userRoleRepository.findByName("USER")
                                            .switchIfEmpty(userRoleRepository.findByName("ADMIN"))
                                            .defaultIfEmpty(new UserRoleEntity());
                                }

                                return roleMono.flatMap(role ->
                                        // 3. Check if user already exists
                                        userInfoRepository.findByUserId(validReq.email())
                                                .switchIfEmpty(userInfoRepository.findByUserName(validReq.userName()))
                                                .flatMap(existingUser ->
                                                        // User already exists; check if linked to this member
                                                        userMemberRepository.existsByUserIdAndMemberId(existingUser.getId(), member.getId())
                                                                .flatMap(exists -> {
                                                                    if (Boolean.TRUE.equals(exists)) {
                                                                        return Mono.error(new IllegalArgumentException("User with this email is already registered in this organization"));
                                                                    }
                                                                    // Link existing user to this member
                                                                    UserMemberEntity userMember = new UserMemberEntity();
                                                                    userMember.setUser(existingUser);
                                                                    userMember.setMember(member);
                                                                    userMember.setCreatedBy(createdBy);
                                                                    return Mono.from(userMemberRepository.save(userMember))
                                                                            .map(saved -> mapToResponse(existingUser, member));
                                                                })
                                                )
                                                .switchIfEmpty(Mono.defer(() -> {
                                                    // 4. Create new user entity and link to member
                                                    UserInfoEntity newUser = buildUserEntity(validReq, role, createdBy);
                                                    return Mono.from(userInfoRepository.save(newUser))
                                                            .flatMap(savedUser -> {
                                                                UserMemberEntity userMember = new UserMemberEntity();
                                                                userMember.setUser(savedUser);
                                                                userMember.setMember(member);
                                                                userMember.setCreatedBy(createdBy);
                                                                return Mono.from(userMemberRepository.save(userMember))
                                                                        .map(saved -> mapToResponse(savedUser, member));
                                                            });
                                                }))
                                );
                            });
                })
                .doOnError(err -> LOG.error("User enrollment failed for email {}: ", request != null ? request.email() : "N/A", err));
    }

    private UserInfoEntity buildUserEntity(AddUserUCRequest request, UserRoleEntity role, String createdBy) {
        UserInfoEntity user = new UserInfoEntity();
        user.setUserName(request.userName());
        user.setUserId(request.email());
        user.setEmail(request.email());
        user.setPassword(SecurityUtils.hashPassword(request.password()));
        user.setPhoneNumber(request.phoneNumber());
        user.setEnable(request.enable() != null ? request.enable() : true);
        user.setCreatedBy(createdBy);
        user.setUpdatedBy(createdBy);

        if (role != null && role.getId() != null) {
            user.setRole(String.valueOf(role.getId()));
            if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
                String permissionIds = JsonUtils.toJsonString(
                        role.getPermissions()
                                .stream()
                                .map(UserPermissionEntity::getId)
                                .toList()
                );
                user.setPermission(permissionIds);
            } else {
                user.setPermission(null);
            }
        } else {
            user.setRole("ADMIN");
            user.setPermission(null);
        }

        return user;
    }

    private AddUserUCResponse mapToResponse(UserInfoEntity user, MemberEntity member) {
        return AddUserUCResponse.builder()
                .id(user.getId())
                .userId(user.getId())
                .userName(user.getUserName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isActive(user.getEnable() != null && user.getEnable())
                .memberId(member.getId())
                .memberName(member.getOrganizationName())
                .createdBy(user.getCreatedBy())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
