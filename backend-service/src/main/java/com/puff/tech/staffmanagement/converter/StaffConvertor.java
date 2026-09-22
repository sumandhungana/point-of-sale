package com.puff.tech.staffmanagement.converter;

import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.staffmanagement.repository.OrganizationStaffEntity;
import com.puff.tech.security.UserSecurityContext;
import com.puff.tech.staffmanagement.repository.StaffAttendanceEntity;
import com.puff.tech.staffmanagement.repository.StaffSalaryEntity;
import com.puff.tech.staffmanagement.usecase.staff.create.CreateStaffUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staff.get.GetStaffUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staff.get.StaffAttendanceResponse;
import com.puff.tech.staffmanagement.usecase.staff.get.StaffSalaryResponse;
import com.puff.tech.staffmanagement.usecase.staff.update.UpdateStaffUseCaseRequest;

import java.util.Base64;
import java.util.Collections;
import java.util.List;

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
        if(context.memberId() != null) {
            MemberEntity memberEntity = new MemberEntity();
            memberEntity.setId(context.memberId());
            staffEntity.setMember(memberEntity);
        }
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

    public static GetStaffUseCaseResponse toResponse(OrganizationStaffEntity entity){
        if (entity == null) {
            return null;
        }

        List<StaffSalaryResponse> salaryResponses = entity.getSalaries() != null
                ? entity.getSalaries().stream()
                .map(StaffSalaryConvertor::toSalaryResponse)
                .toList()
                : Collections.emptyList();

        List<StaffAttendanceResponse> attendanceResponses = entity.getAttendances() != null
                ? entity.getAttendances().stream()
                .map(StaffAttendanceConvertor::toAttendanceResponse)
                .toList()
                : Collections.emptyList();

        return new GetStaffUseCaseResponse(
                entity.getId(),
                entity.getName(),
                entity.getPhone(),
                entity.getAddress(),
                entity.getEmail(),
                entity.getRemarks(),
                entity.getProfileImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                salaryResponses,
                attendanceResponses
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
