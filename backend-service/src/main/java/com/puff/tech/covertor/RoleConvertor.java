package com.puff.tech.covertor;

import com.puff.tech.entity.RoleEntity;
import com.puff.tech.entity.RolePermissionEntity;
import com.puff.tech.usecase.role.create.CreateRoleUseCaseRequest;
import com.puff.tech.usecase.role.createpermission.CreatePermissionToRoleUseCaseRequest;
import com.puff.tech.usecase.role.get.GetRoleUseCaseResponse;
import com.puff.tech.usecase.role.update.UpdateRoleUseCaseRequest;


public class RoleConvertor {
    private RoleConvertor(){}

    public static RoleEntity toEntity(CreateRoleUseCaseRequest request){
        RoleEntity roleEntity= new RoleEntity();
        roleEntity.setName(request.name());
        roleEntity.setStatus(request.status());
        roleEntity.setDescription(roleEntity.getDescription());
        return roleEntity;
    }

    public static GetRoleUseCaseResponse toResponse(RoleEntity roleEntity){
        return new GetRoleUseCaseResponse(
                roleEntity.getId(),
                roleEntity.getName(),
                roleEntity.getStatus(),
                roleEntity.getDescription(),
                roleEntity.getCreatedAt(),
                roleEntity.getUpdatedAt(),
                roleEntity.getRolePermissions()
        );
    }

    public static RoleEntity toEntityUpdate(UpdateRoleUseCaseRequest request,
                                            RoleEntity roleEntity){

        roleEntity.setName(request.name());
        roleEntity.setStatus(request.status());
        roleEntity.setDescription(roleEntity.getDescription());
        return roleEntity;
    }

}
