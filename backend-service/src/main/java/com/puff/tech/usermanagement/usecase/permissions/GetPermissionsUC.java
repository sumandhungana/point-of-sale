package com.puff.tech.usermanagement.usecase.permissions;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.enums.Permission;
import com.puff.tech.usermanagement.usecase.permissions.payload.GetPermissionsUCRequest;
import com.puff.tech.usermanagement.usecase.permissions.payload.GetPermissionsUCResponse;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Singleton
public class GetPermissionsUC implements FluxUC<GetPermissionsUCRequest, GetPermissionsUCResponse> {
    @Override
    public Flux<GetPermissionsUCResponse> execute(GetPermissionsUCRequest request, UseCaseContext context) {
        Map<String, List<String>> groupedPermissions = Arrays.stream(Permission.values())
                .collect(Collectors.groupingBy(
                        permission -> permission.getModule().getCode(), // Or getModule().getDisplayName()
                        Collectors.mapping(Permission::getValue, Collectors.toList())
                ));

        return Flux.fromIterable(groupedPermissions.entrySet())
                .map(entry -> GetPermissionsUCResponse.builder()
                        .module(entry.getKey())
                        .permissions(entry.getValue())
                        .build());
    }
}
