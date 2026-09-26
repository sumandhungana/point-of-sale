package com.puff.tech.covertor;

import com.puff.tech.core.utils.SecurityUtils;
import com.puff.tech.entity.UserEntity;
import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.onboarding.usecase.user.add.AddUserUseCaseRequest;
import com.puff.tech.onboarding.usecase.user.get.GetUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.user.update.UpdateUserUseCaseRequest;
import java.util.Arrays;

public class UserConvertor {
    private UserConvertor(){}

    public static UserEntity toEntity(AddUserUseCaseRequest request){

        String hash= SecurityUtils.hashPassword(request.password());
        String salt= Arrays.toString( SecurityUtils.generateSalt());
        UserEntity userEntity= new UserEntity();
        userEntity.setUserName(request.userName());
        userEntity.setPassword(SecurityUtils.hashPassword(request.password()));
        userEntity.setBranch(request.branch());
        userEntity.setParent(request.parent());
        userEntity.setName(request.name());
        userEntity.setAddress(request.address());
        userEntity.setCompany(request.company());
        userEntity.setEmail(request.email());
        userEntity.setPhone(request.phone());
        userEntity.setPan(request.pan());
        userEntity.setPasswordHash(hash);
        userEntity.setPasswordSalt(salt);

        return userEntity;
    }

    public static UserEntity updateRequestToEntity(UserEntity userEntity, UpdateUserUseCaseRequest request) {
        userEntity.setBranch(request.branch());
        userEntity.setParent(request.parent());
        userEntity.setName(request.name());
        userEntity.setAddress(request.address());
        userEntity.setCompany(request.company());
        userEntity.setEmail(request.email());
        userEntity.setPhone(request.phone());
        userEntity.setPan(request.pan());

        return userEntity;
    }


    public static GetUserUseCaseResponse toGetUsers(UserInfoEntity user){
        return GetUserUseCaseResponse.builder()
                .userId(user.getId())
                .userName(user.getUserName())
                .role(user.getRole())
                .isActive(user.getEnable())
                .createdAt(user.getCreatedAt())
                .createdBy(user.getCreatedBy())
                .updatedAt(user.getUpdatedAt())
                .updatedBy(user.getUpdatedBy())
                .build();
    }
}
