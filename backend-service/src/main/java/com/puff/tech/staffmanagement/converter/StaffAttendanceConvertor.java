package com.puff.tech.staffmanagement.converter;

import com.puff.tech.staffmanagement.repository.StaffAttendanceEntity;
import com.puff.tech.staffmanagement.usecase.staff.get.StaffAttendanceResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAtendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseRequest;

import java.time.Instant;

public class StaffAttendanceConvertor {
    private StaffAttendanceConvertor(){}

    public static StaffAttendanceResponse toAttendanceResponse(StaffAttendanceEntity entity) {
        if (entity == null) {
            return null;
        }

        return new StaffAttendanceResponse(
                entity.getId(),
                Instant.now(),
                entity.getStatus().toString(),
                "entity.getRemarks()",
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static StaffAttendanceEntity toEntity(CreateStaffAtendanceUseCaseRequest request,
                                                 Integer khataBookId){
        StaffAttendanceEntity staffAttendanceEntity= new StaffAttendanceEntity();
//        staffAttendanceEntity.setMemberId(khataBookId);
//        staffAttendanceEntity.setStaffId(request.staffId());
        staffAttendanceEntity.setStatus(request.status());
        staffAttendanceEntity.setNote(request.note());
        return staffAttendanceEntity;
    }

    public static GetStaffAttendanceUseCaseResponse toResponse(StaffAttendanceEntity staffAttendanceEntity){
        return new GetStaffAttendanceUseCaseResponse(
                staffAttendanceEntity.getId(),
                1111,
                staffAttendanceEntity.getDate(),
                staffAttendanceEntity.getStatus(),
                staffAttendanceEntity.getNote(),
                staffAttendanceEntity.getCreatedAt(),
                staffAttendanceEntity.getUpdatedAt()
        );
    }

    public static StaffAttendanceEntity toEntityUpdate(UpdateSatffAttendanceUseCaseRequest request,
                                                       StaffAttendanceEntity staffAttendanceEntity){

//        staffAttendanceEntity.setStaffId(request.staffId());
        staffAttendanceEntity.setStatus(request.status());
        staffAttendanceEntity.setNote(request.note());
        return staffAttendanceEntity;
    }

}
