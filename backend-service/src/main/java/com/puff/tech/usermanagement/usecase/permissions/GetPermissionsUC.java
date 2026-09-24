package com.puff.tech.usermanagement.usecase.permissions;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.enums.Permissions;
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
        Map<String, List<String>> groupedPermissions = Arrays.stream(Permissions.values())
                .collect(Collectors.groupingBy(
                        Permissions::getModule,
                        Collectors.mapping(Permissions::getValue, Collectors.toList())
                ));

        return Flux.fromIterable(groupedPermissions.entrySet())
                .map(entry -> GetPermissionsUCResponse.builder()
                        .module(entry.getKey())
                        .permissions(entry.getValue())
                        .build());
    }
}
