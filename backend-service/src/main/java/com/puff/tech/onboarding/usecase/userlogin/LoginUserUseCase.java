package com.puff.tech.onboarding.usecase.userlogin;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.utils.JwtUtils;
import com.puff.tech.core.utils.SecurityUtils;
import com.puff.tech.core.utils.JwtTokenInfo;
import com.puff.tech.entity.RoleEntity;
import com.puff.tech.entity.RolePermissionEntity;
import com.puff.tech.onboarding.repository.*;
import com.puff.tech.repository.RoleRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserPermissionRepository;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import com.puff.tech.usermanagement.usecase.permissions.payload.GetPermissionsUCResponse;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Singleton
public class LoginUserUseCase implements MonoUC<LoginUserUseCaseRequest,LoginUserUseCaseResponse> {

    private final UserInfoRepository userInfoRepository;
    private final UserMemberRepository userMemberRepository;
    private final UserRoleRepository userRoleRepository;

    public LoginUserUseCase(UserInfoRepository userInfoRepository,
                            UserMemberRepository userMemberRepository,
                            UserRoleRepository userRoleRepository){
        this.userInfoRepository = userInfoRepository;
        this.userMemberRepository = userMemberRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Mono<LoginUserUseCaseResponse> execute(LoginUserUseCaseRequest request, UseCaseContext context) {
        return userInfoRepository.findByUserId(request.username())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid username")))
                .filter(userInfo -> userInfo.getEnable() == true)
                .switchIfEmpty(Mono.error(new Throwable("User Is not Active. Please contact Administrator")))
                .filter(userInfoEntity -> SecurityUtils.verifyPassword(request.password(), userInfoEntity.getPassword()))
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid password")))
                .flatMap(userInfoEntity ->
                        // 1. Fetch Member/Organization details
                        Mono.from(userMemberRepository.findByUser(userInfoEntity))
                                .map(UserMemberEntity::getMember)
                                .defaultIfEmpty(new MemberEntity())
                                .flatMap(member -> {
                                    Long memberId = Objects.nonNull(member) ? member.getId() : null;

                                    // 2. Fetch UserRoleEntity with joined permissions by role name and memberId
                                    Mono<UserRoleEntity> roleMono = (memberId != null && userInfoEntity.getRole() != null)
                                            ? userRoleRepository.findById(Integer.valueOf(userInfoEntity.getRole()))
                                            .defaultIfEmpty(new UserRoleEntity())
                                            : Mono.just(new UserRoleEntity());

                                    return roleMono.map(role -> mapToResponse(userInfoEntity, member, role));
                                })
                );
//                .flatMap(userInfoEntity -> {
                    // 1. Fetch Member/Organization details

//                });
//                .flatMap(userInfoEntity ->
//                        // Fetch user's member/organization details
//                        Mono.from(userMemberRepository.findByUser(userInfoEntity))
//                                .map(UserMemberEntity::getMember)
//                                .defaultIfEmpty(new MemberEntity()) // Fallback in case user has no organization linked
//                                .map(member -> mapToResponse(userInfoEntity, member))
//                );
    }

    private LoginUserUseCaseResponse mapToResponse(UserInfoEntity user, MemberEntity member, UserRoleEntity role) {
        Long memberId = Objects.nonNull(member) ? member.getId() : null;
        String orgName = Objects.nonNull(member) ? member.getOrganizationName() : null;
        List<UserPermissionEntity> permissionEntities = Objects.nonNull(role.getPermissions())
                ? role.getPermissions()
                : Collections.emptyList();

        // Collect modules into a single distinct string (e.g., "user,customer")
        String modules = permissionEntities.stream()
                .map(UserPermissionEntity::getModule)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.joining(","));

        // Flatten all JSON permissions lists (e.g., ["user:create", "user:read", "customer:create"]) into a single string
        // Flatten all nested lists into a single List<String>
        List<String> permissionsList = permissionEntities.stream()
                .filter(p -> Objects.nonNull(p.getPermissions()))
                .flatMap(p -> p.getPermissions().stream())
                .distinct()
                .toList();

        String roleName = Objects.nonNull(role.getName()) ? role.getName() : user.getRole();
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
                        .role(roleName)
                        .permissionResponse(GetPermissionsUCResponse.builder()
                                .module(modules)
                                .permissions(permissionsList)
                                .build())
                        .enabled(user.getEnable())
                        .build()
        );
    }

    private static JwtTokenInfo prepareJwtTokenInfo(UserInfoEntity userInfo, Long memberId) {
        return new JwtTokenInfo(
                userInfo.getUserId(),
                userInfo.getId().toString(),
                userInfo.getUserName(),
                userInfo.getRole(),
                userInfo.getPermission(),
                userInfo.getEnable(),
                memberId // Pass memberId into JWT payload
        );
    }
}
