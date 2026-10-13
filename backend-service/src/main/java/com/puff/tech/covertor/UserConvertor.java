package com.puff.tech.covertor;

import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.onboarding.usecase.user.get.GetUserUCResponse;

public class UserConvertor {
    private UserConvertor(){}

    public static GetUserUCResponse toGetUsers(UserInfoEntity user){
        if (user == null) {
            return null;
        }
        return GetUserUCResponse.builder()
                .userId(user.getId())
                .userName(user.getUserName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isActive(user.getEnable() != null && user.getEnable())
                .createdAt(user.getCreatedAt())
                .createdBy(user.getCreatedBy())
                .updatedAt(user.getUpdatedAt())
                .updatedBy(user.getUpdatedBy())
                .build();
    }
}
