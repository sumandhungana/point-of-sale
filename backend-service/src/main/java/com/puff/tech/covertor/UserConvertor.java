package com.puff.tech.covertor;

import com.puff.tech.core.utils.SecurityUtils;
import com.puff.tech.entity.UserEntity;
import com.puff.tech.usecase.user.add.AddUserUseCaseRequest;
import com.puff.tech.usecase.user.get.GetUserUseCaseResponse;
import com.puff.tech.usecase.user.update.UpdateUserUseCaseRequest;
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


    public static GetUserUseCaseResponse toGetUsers(UserEntity user){
        return new GetUserUseCaseResponse(
                user.getUserName(),
                user.getBranch(),
                user.getPermission(),
                user.getParent(),
                user.getName(),
                user.getAddress(),
                user.getCompany(),
                user.getEmail(),
                user.getPhone(),
                user.getPan(),
                user.getCreatedAt(),
                user.getUpdatedAt()

        );
    }
}
