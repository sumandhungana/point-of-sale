package com.puff.tech.onboarding.usecase.flush;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.utils.JwtTokenInfo;
import com.puff.tech.core.utils.JwtUtils;
import com.puff.tech.onboarding.repository.*;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCaseResponse;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
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
public class FlushTokenUC implements MonoUC<FlushTokenUCRequest, LoginUserUseCaseResponse> {

    private final UserInfoRepository userInfoRepository;
    private final MemberRepository memberRepository;
    private final UserRoleRepository userRoleRepository;

    public FlushTokenUC(UserInfoRepository userInfoRepository,
                        MemberRepository memberRepository,
                        UserRoleRepository userRoleRepository) {
        this.userInfoRepository = userInfoRepository;
        this.memberRepository = memberRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Mono<LoginUserUseCaseResponse> execute(FlushTokenUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        Long userId = Long.parseLong(context.securityContext().userId());
        Long refMember = request.refMemberId() == 0 ?  request.memberId(): request.refMemberId();
        return Mono.from(memberRepository.findById(request.memberId()))
                .switchIfEmpty(Mono.error(new Throwable("Child Member Not Found")))
                .filter(member -> Objects.equals(member.getRefMemberId() == null ? member.getId() : member.getRefMemberId(), refMember))
                .switchIfEmpty(Mono.error(new Throwable("Invalid Member Id Found for reference member")))
                .flatMap(member -> {
                    // 1. Fetch UserInfo by ID
                    Mono<UserInfoEntity> userInfoMono = Mono.from(userInfoRepository.findById(userId))
                            .switchIfEmpty(Mono.error(new Throwable("User Not Found")));

                    return userInfoMono.flatMap(userInfo -> {
                        // 2. Fetch UserRoleEntity by role string ID if present
                        Mono<UserRoleEntity> roleMono = (userInfo.getRole() != null)
                                ? Mono.from(userRoleRepository.findById(Integer.valueOf(userInfo.getRole())))
                                .defaultIfEmpty(new UserRoleEntity())
                                : Mono.just(new UserRoleEntity());

                        // 3. Combine fetched details and construct response
                        return roleMono.map(role -> mapToResponse(userInfo, member, role));
                    });
                });

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
                "Success Prepare new Token",
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
