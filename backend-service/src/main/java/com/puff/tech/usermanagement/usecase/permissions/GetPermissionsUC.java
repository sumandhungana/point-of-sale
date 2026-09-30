package com.puff.tech.usermanagement.usecase.permissions;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.enums.Permission;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import com.puff.tech.usermanagement.usecase.permissions.payload.GetPermissionsUCRequest;
import com.puff.tech.usermanagement.usecase.permissions.payload.GetPermissionsUCResponse;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Singleton
public class GetPermissionsUC implements FluxUC<GetPermissionsUCRequest, GetPermissionsUCResponse> {

    private final UserRoleRepository userRoleRepository;
    // Strategy Map: Maps specific role orders to their explicit permission handlers
    // Direct mapping strictly for role orders 1 and 2
    private final Map<Integer, Function<UserRoleEntity, Flux<GetPermissionsUCResponse>>> roleOrderHandlers = Map.of(
            1, roleEntity -> getPermissionsFromEnum(),
            2, this::getPermissionsFromDatabase
    );

    public GetPermissionsUC(UserRoleRepository userRoleRepository) {
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Flux<GetPermissionsUCResponse> execute(GetPermissionsUCRequest request, UseCaseContext context) {
        String roleIdStr = context.securityContext().roles().getFirst();
        return Mono.fromCallable(() -> roleIdStr)
                .flatMap(userRoleRepository::findByName)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Role not found for ID: " + roleIdStr)))
                .flatMapMany(roleEntity ->
                        // Match roleOrder against the map. If order is not 1 or 2, default to Flux.empty()
                        Optional.ofNullable(roleEntity.getRoleOrder())
                                .map(roleOrderHandlers::get)
                                .map(handler -> handler.apply(roleEntity))
                                .orElseGet(Flux::empty)
                );
    }


    /**
     * Resolves permissions assigned to the role from the database entity, grouped by module.
     */
    private Flux<GetPermissionsUCResponse> getPermissionsFromDatabase(UserRoleEntity roleEntity) {
        List<UserPermissionEntity> permissions = roleEntity.getPermissions();

        if (permissions == null || permissions.isEmpty()) {
            return Flux.empty();
        }

        Map<String, List<String>> groupedPermissions = permissions.stream()
                .collect(Collectors.groupingBy(
                        UserPermissionEntity::getModule,
                        Collectors.flatMapping(
                                entity -> entity.getPermissions().stream(),
                                Collectors.toList()
                        )// Maps and flattens inner permission lists
                ));

        return Flux.fromIterable(groupedPermissions.entrySet())
                .map(entry -> GetPermissionsUCResponse.builder()
                        .module(entry.getKey())
                        .permissions(entry.getValue())
                        .build());
    }

    /**
     * Resolves all available system permissions grouped by module from the Enum.
     */
    private Flux<GetPermissionsUCResponse> getPermissionsFromEnum() {
        Map<String, List<String>> groupedPermissions = Arrays.stream(Permission.values())
                .collect(Collectors.groupingBy(
                        permission -> permission.getModule().getCode(),
                        Collectors.mapping(Permission::getValue, Collectors.toList())
                ));

        return Flux.fromIterable(groupedPermissions.entrySet())
                .map(entry -> GetPermissionsUCResponse.builder()
                        .module(entry.getKey())
                        .permissions(entry.getValue())
                        .build());
    }
}
