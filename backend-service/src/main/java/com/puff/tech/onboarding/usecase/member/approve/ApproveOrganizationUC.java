package com.puff.tech.onboarding.usecase.member.approve;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.utils.JsonUtils;
import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.onboarding.repository.UserInfoRepository;
import com.puff.tech.onboarding.repository.UserMemberRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.security.UserSecurityContext;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Singleton
public class ApproveOrganizationUC implements MonoUC<ApproveOrganizationUCRequest, ApproveOrganizationUCResponse> {

    private static final Logger LOG = LoggerFactory.getLogger(ApproveOrganizationUC.class);
    private final UserInfoRepository userInfoRepository;
    private final UserMemberRepository userMemberRepository;
    private final UserRoleRepository userRoleRepository;

    public ApproveOrganizationUC(UserInfoRepository userInfoRepository,
                                 UserMemberRepository userMemberRepository,
                                 UserRoleRepository userRoleRepository) {
        this.userInfoRepository = userInfoRepository;
        this.userMemberRepository = userMemberRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Mono<ApproveOrganizationUCResponse> execute(ApproveOrganizationUCRequest request, UseCaseContext context) {
        if (request == null || request.memberId() == null) {
            return Mono.error(new IllegalArgumentException("Organization ID is required for approval"));
        }

        String updatedBy = Optional.ofNullable(context)
                .map(UseCaseContext::securityContext)
                .map(UserSecurityContext::subject)
                .filter(subject -> !subject.isBlank())
                .orElse("Admin");

        // 1. Resolve user associated with member
        Mono<UserInfoEntity> userMono = (request.userId() != null)
                ? Mono.from(userInfoRepository.findById(request.userId()))
                : userMemberRepository.findByMemberId(request.memberId())
                        .next()
                        .flatMap(um -> {
                            if (um.getUser() != null && um.getUser().getId() != null) {
                                return Mono.from(userInfoRepository.findById(um.getUser().getId()));
                            }
                            return Mono.empty();
                        });

        return userMono
                .switchIfEmpty(Mono.error(new IllegalStateException("No user found associated with organization ID: " + request.memberId())))
                .flatMap(user -> {
                    String targetRoleId = (request.roleId() != null && !request.roleId().isBlank())
                            ? request.roleId()
                            : user.getRole();

                    if (targetRoleId == null || targetRoleId.isBlank()) {
                        targetRoleId = "2";
                    }

                    String finalRoleId = targetRoleId;
                    return userRoleRepository.findById(Integer.valueOf(finalRoleId))
                            .switchIfEmpty(Mono.error(new IllegalStateException("Role ID '" + finalRoleId + "' not found")))
                            .flatMap(role -> {
                                user.setRole(String.valueOf(role.getId()));
                                if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
                                    String permissionIds = JsonUtils.toJsonString(
                                            role.getPermissions()
                                                    .stream()
                                                    .map(UserPermissionEntity::getId)
                                                    .toList()
                                    );
                                    user.setPermission(permissionIds);
                                }
                                user.setEnable(true);
                                user.setUpdatedBy(updatedBy);
                                return Mono.from(userInfoRepository.update(user));
                            })
                            .map(savedUser -> ApproveOrganizationUCResponse.builder()
                                    .memberId(request.memberId())
                                    .userId(savedUser.getId())
                                    .status("ACTIVE")
                                    .message("Organization approved and user activated successfully")
                                    .build());
                })
                .doOnError(err -> LOG.error("Failed to approve organization {}: ", request.memberId(), err))
                .onErrorResume(Mono::error);
    }
}
