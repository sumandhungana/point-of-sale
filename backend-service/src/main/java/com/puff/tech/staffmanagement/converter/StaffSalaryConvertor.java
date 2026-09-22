package com.puff.tech.staffmanagement.converter;

import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.staffmanagement.repository.OrganizationStaffEntity;
import com.puff.tech.staffmanagement.repository.StaffSalaryEntity;
import com.puff.tech.staffmanagement.usecase.staff.get.StaffSalaryResponse;
import com.puff.tech.staffmanagement.usecase.staffsalary.create.CreateStaffSalaryUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffsalary.get.GetStaffSalaryUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffsalary.update.UpdateStaffSalaryUseCaseRequest;

import java.time.Instant;
import java.time.ZoneOffset;


public class StaffSalaryConvertor {
    private StaffSalaryConvertor(){}

    public static StaffSalaryResponse toSalaryResponse(StaffSalaryEntity entity) {
        if (entity == null) {
            return null;
        }

        return new StaffSalaryResponse(
                entity.getId(),
                entity.getMonth(),
                entity.getYear(),
                entity.getSelectedDate(),
                entity.getIsSlideOn(),
                entity.getCalculationDate(),
                entity.getSalaryType(),
                entity.getAmount(),
                entity.getPermission(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
    public static StaffSalaryEntity toEntity(CreateStaffSalaryUseCaseRequest request,
                                             Long memberId){
        StaffSalaryEntity staffSalaryEntity= new StaffSalaryEntity();
        if (memberId != null) {
            MemberEntity memberRef = new MemberEntity();
            memberRef.setId(memberId); // Sets FK for member_id
            staffSalaryEntity.setMember(memberRef);
        }
        if(request.staffId() != null) {
            OrganizationStaffEntity staff = new OrganizationStaffEntity();
            staff.setId(request.staffId());
            staffSalaryEntity.setStaff(staff);
        }
        staffSalaryEntity.setMonth(request.month());
        staffSalaryEntity.setYear(request.year());
        Instant selectedInstant = request.selectedDate() != null
                ? request.selectedDate().toInstant(ZoneOffset.UTC)
                : null;
        staffSalaryEntity.setSelectedDate(selectedInstant);
        staffSalaryEntity.setIsSlideOn(request.isSlideOn());
        Instant calculationInstant = request.calculationDate() != null
                ? request.calculationDate().toInstant(ZoneOffset.UTC)
                : null;
        staffSalaryEntity.setCalculationDate(calculationInstant);
        staffSalaryEntity.setSalaryType(request.salaryType());
        staffSalaryEntity.setAmount(request.amount());
        staffSalaryEntity.setPermission(request.permission());
        return staffSalaryEntity;
    }

    public static GetStaffSalaryUseCaseResponse toResponse(StaffSalaryEntity staffSalaryEntity){
        return new GetStaffSalaryUseCaseResponse(
                staffSalaryEntity.getId(),
                staffSalaryEntity.getStaff().getId(),
                staffSalaryEntity.getMonth(),
                staffSalaryEntity.getYear(),
                staffSalaryEntity.getSelectedDate(),
                staffSalaryEntity.getIsSlideOn(),
                staffSalaryEntity.getCalculationDate(),
                staffSalaryEntity.getSalaryType(),
                staffSalaryEntity.getAmount(),
                staffSalaryEntity.getPermission(),
                staffSalaryEntity.getCreatedAt(),
                staffSalaryEntity.getUpdatedAt()
        );
    }

    public static StaffSalaryEntity toEntityUpdate(UpdateStaffSalaryUseCaseRequest request,
                                             StaffSalaryEntity staffSalaryEntity    ){

//        staffSalaryEntity.setStaffId(request.staffId());
        staffSalaryEntity.setMonth(request.month());
        staffSalaryEntity.setYear(request.year());
        staffSalaryEntity.setSelectedDate(request.selectedDate());
        staffSalaryEntity.setIsSlideOn(request.isSlideOn());
        staffSalaryEntity.setCalculationDate(request.calculationDate());
        staffSalaryEntity.setSalaryType(request.salaryType());
        staffSalaryEntity.setAmount(request.amount());
        staffSalaryEntity.setPermission(request.permission());
        return staffSalaryEntity;
    }



}
