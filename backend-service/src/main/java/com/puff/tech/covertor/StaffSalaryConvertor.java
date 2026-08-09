package com.puff.tech.covertor;

import com.puff.tech.entity.StaffSalaryEntity;
import com.puff.tech.usecase.staffsalary.create.CreateStaffSalaryUseCaseRequest;
import com.puff.tech.usecase.staffsalary.get.GetStaffSalaryUseCaseResponse;
import com.puff.tech.usecase.staffsalary.update.UpdateStaffSalaryUseCaseRequest;


public class StaffSalaryConvertor {
    private StaffSalaryConvertor(){}

    public static StaffSalaryEntity toEntity(CreateStaffSalaryUseCaseRequest request,
                                             Integer khataBookId){
        StaffSalaryEntity staffSalaryEntity= new StaffSalaryEntity();
        staffSalaryEntity.setKhataBookId(khataBookId);
        staffSalaryEntity.setStaffId(request.staffId());
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

    public static GetStaffSalaryUseCaseResponse toResponse(StaffSalaryEntity staffSalaryEntity){
        return new GetStaffSalaryUseCaseResponse(
                staffSalaryEntity.getId(),
                staffSalaryEntity.getStaffId(),
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

        staffSalaryEntity.setStaffId(request.staffId());
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
