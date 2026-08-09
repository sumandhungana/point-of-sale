package com.puff.tech.covertor;

import com.puff.tech.entity.PermissionEntity;
import com.puff.tech.usecase.permission.create.CreatePermissionUseCaseRequest;
import com.puff.tech.usecase.permission.get.GetPermissionUseCaseResponse;
import com.puff.tech.usecase.permission.update.UpdatePermissionUseCaseRequest;

public class PermissionConvertor {
    private PermissionConvertor(){}

    public static PermissionEntity toEntity(CreatePermissionUseCaseRequest request){
        PermissionEntity permissionEntity= new PermissionEntity();
        permissionEntity.setModule(request.module());
        permissionEntity.setPermissionName(request.permissionName());

        return permissionEntity;
    }

    public static GetPermissionUseCaseResponse toResponse(PermissionEntity permissionEntity){
        return new GetPermissionUseCaseResponse(
                permissionEntity.getId(),
                permissionEntity.getModule(),
                permissionEntity.getPermissionName(),
                permissionEntity.getCreatedAt(),
                permissionEntity.getUpdatedAt(),
                permissionEntity.getRolePermissions()
        );
    }

    public static PermissionEntity toUpdateEntity(UpdatePermissionUseCaseRequest request,
                                                  PermissionEntity permissionEntity){

        permissionEntity.setModule(request.module());
        permissionEntity.setPermissionName(request.permissionName());
        return permissionEntity;
    }
}
