package com.puff.tech.covertor;

import com.puff.tech.domain.AttendanceStatus;
import com.puff.tech.entity.StaffAttendanceEntity;
import com.puff.tech.usecase.staffattendance.create.CreateStaffAtendanceUseCaseRequest;
import com.puff.tech.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import com.puff.tech.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseRequest;

import java.time.Instant;

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
