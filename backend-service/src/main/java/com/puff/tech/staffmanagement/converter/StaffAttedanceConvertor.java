package com.puff.tech.staffmanagement.converter;

import com.puff.tech.entity.StaffAttendanceEntity;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAtendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseRequest;

public class StaffAttedanceConvertor {
    private StaffAttedanceConvertor(){}

    public static StaffAttendanceEntity toEntity(CreateStaffAtendanceUseCaseRequest request,
                                                 Integer khataBookId){
        StaffAttendanceEntity staffAttendanceEntity= new StaffAttendanceEntity();
        staffAttendanceEntity.setKhataBookId(khataBookId);
        staffAttendanceEntity.setStaffId(request.staffId());
        staffAttendanceEntity.setStatus(request.status());
        staffAttendanceEntity.setNote(request.note());
        return staffAttendanceEntity;
    }

    public static GetStaffAttendanceUseCaseResponse toResponse(StaffAttendanceEntity staffAttendanceEntity){
        return new GetStaffAttendanceUseCaseResponse(
                staffAttendanceEntity.getId(),
                staffAttendanceEntity.getStaffId(),
                staffAttendanceEntity.getDate(),
                staffAttendanceEntity.getStatus(),
                staffAttendanceEntity.getNote(),
                staffAttendanceEntity.getCreatedAt(),
                staffAttendanceEntity.getUpdatedAt()
        );
    }

    public static StaffAttendanceEntity toEntityUpdate(UpdateSatffAttendanceUseCaseRequest request,
                                                       StaffAttendanceEntity staffAttendanceEntity){

        staffAttendanceEntity.setStaffId(request.staffId());
        staffAttendanceEntity.setStatus(request.status());
        staffAttendanceEntity.setNote(request.note());
        return staffAttendanceEntity;
    }

}
