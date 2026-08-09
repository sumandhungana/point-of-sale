package com.puff.tech.covertor;

import com.puff.tech.entity.StaffEntity;
import com.puff.tech.usecase.staff.create.CreateStaffUseCaseRequest;
import com.puff.tech.usecase.staff.get.GetStaffUseCaseResponse;
import com.puff.tech.usecase.staff.update.UpdateStaffUseCaseRequest;

import java.util.Base64;

public class StaffConvertor {
    private StaffConvertor(){}

    public static StaffEntity toEntity(CreateStaffUseCaseRequest request,
                                       Integer khataBookId){
        StaffEntity staffEntity= new StaffEntity();
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
    private static String getImageBase64String(byte[] src){
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetStaffUseCaseResponse toResponse(StaffEntity staffEntity){
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

    public static StaffEntity toEntityUpdate(UpdateStaffUseCaseRequest request, StaffEntity staffEntity){

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
