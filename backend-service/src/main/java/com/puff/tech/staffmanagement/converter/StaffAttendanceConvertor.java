package com.puff.tech.staffmanagement.converter;

import com.puff.tech.domain.AttendanceStatus;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.staffmanagement.repository.OrganizationStaffEntity;
import com.puff.tech.staffmanagement.repository.StaffAttendanceEntity;
import com.puff.tech.staffmanagement.usecase.staff.get.StaffAttendanceResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAtendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseRequest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class StaffAttendanceConvertor {
    private StaffAttendanceConvertor(){}

    public static StaffAttendanceResponse toAttendanceResponse(StaffAttendanceEntity entity) {
        if (entity == null) {
            return null;
        }

        return new StaffAttendanceResponse(
                entity.getId(),
                entity.getDate() != null ? entity.getDate() : entity.getCreatedAt(),
                entity.getStatus() != null ? entity.getStatus().name() : "PRESENT",
                entity.getNote() != null ? entity.getNote() : "",
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static StaffAttendanceEntity toEntity(CreateStaffAtendanceUseCaseRequest request,
                                                 Integer khataBookId){
        StaffAttendanceEntity staffAttendanceEntity = new StaffAttendanceEntity();
        if (khataBookId != null) {
            MemberEntity member = new MemberEntity();
            member.setId(Long.valueOf(khataBookId));
            staffAttendanceEntity.setMember(member);
        }
        if (request.staffId() != null) {
            OrganizationStaffEntity staff = new OrganizationStaffEntity();
            staff.setId(request.staffId());
            staffAttendanceEntity.setStaff(staff);
        }
        Instant targetDate = request.date() != null ? request.date() : Instant.now();
        staffAttendanceEntity.setDate(targetDate.truncatedTo(ChronoUnit.DAYS));
        staffAttendanceEntity.setStatus(request.status() != null ? request.status() : AttendanceStatus.PRESENT);
        staffAttendanceEntity.setNote(request.note() != null ? request.note() : "");
        return staffAttendanceEntity;
    }

    public static GetStaffAttendanceUseCaseResponse toResponse(StaffAttendanceEntity staffAttendanceEntity){
        if (staffAttendanceEntity == null) {
            return null;
        }

        Integer staffId = staffAttendanceEntity.getStaff() != null ? staffAttendanceEntity.getStaff().getId() : null;

        return new GetStaffAttendanceUseCaseResponse(
                staffAttendanceEntity.getId(),
                staffId,
                staffAttendanceEntity.getDate(),
                staffAttendanceEntity.getStatus() != null ? staffAttendanceEntity.getStatus() : AttendanceStatus.PRESENT,
                staffAttendanceEntity.getNote() != null ? staffAttendanceEntity.getNote() : "",
                staffAttendanceEntity.getCreatedAt(),
                staffAttendanceEntity.getUpdatedAt()
        );
    }

    public static StaffAttendanceEntity toEntityUpdate(UpdateSatffAttendanceUseCaseRequest request,
                                                       StaffAttendanceEntity staffAttendanceEntity){
        if (request.status() != null) {
            staffAttendanceEntity.setStatus(request.status());
        }
        if (request.note() != null) {
            staffAttendanceEntity.setNote(request.note());
        }
        staffAttendanceEntity.setUpdatedAt(Instant.now());
        return staffAttendanceEntity;
    }

}
