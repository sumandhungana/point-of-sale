package com.puff.tech.staffmanagement.converter;

import com.puff.tech.entity.OrganizationStaffEntity;
import com.puff.tech.security.UserSecurityContext;
import com.puff.tech.staffmanagement.usecase.staff.create.CreateStaffUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staff.get.GetStaffUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staff.update.UpdateStaffUseCaseRequest;

import java.util.Base64;

public class StaffConvertor {
    private StaffConvertor(){}

    public static OrganizationStaffEntity toEntity(CreateStaffUseCaseRequest request,
                                                   UserSecurityContext context){
        OrganizationStaffEntity staffEntity= new OrganizationStaffEntity();
        staffEntity.setName(request.name());
        staffEntity.setPhone(request.phone());
        staffEntity.setAddress(request.address());
        staffEntity.setEmail(request.email());
        staffEntity.setRemarks(request.remarks());
        staffEntity.setMemberId(context.subject());
        try{
            staffEntity.setProfileImageUrl(getImageBase64String(request.profileImageUrl().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return staffEntity;
    }
    private static String getImageBase64String(byte[] src){
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetStaffUseCaseResponse toResponse(OrganizationStaffEntity staffEntity){
        return new GetStaffUseCaseResponse(
                staffEntity.getId(),
                staffEntity.getName(),
                staffEntity.getPhone(),
                staffEntity.getAddress(),
                staffEntity.getEmail(),
                staffEntity.getRemarks(),
                staffEntity.getProfileImageUrl(),
                staffEntity.getCreatedAt(),
                staffEntity.getUpdatedAt()
        );
    }

    public static OrganizationStaffEntity toEntityUpdate(UpdateStaffUseCaseRequest request, OrganizationStaffEntity staffEntity){

        staffEntity.setName(request.name());
        staffEntity.setPhone(request.phone());
        staffEntity.setAddress(request.address());
        staffEntity.setEmail(request.email());
        staffEntity.setRemarks(request.remarks());
        try{
            staffEntity.setProfileImageUrl(getImageBase64String(request.profileImageUrl().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return staffEntity;
    }
}
