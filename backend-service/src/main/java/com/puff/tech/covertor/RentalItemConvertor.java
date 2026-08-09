package com.puff.tech.covertor;

import com.puff.tech.entity.RentalEntity;
import com.puff.tech.usecase.rentalitem.create.CreateRentalItemUseCaseRequest;
import com.puff.tech.usecase.rentalitem.get.GetRentalItemUseCaseResponse;
import com.puff.tech.usecase.rentalitem.update.UpdateRentalItemUseCaseRequest;


public class RentalItemConvertor {
    private RentalItemConvertor(){}

    public static RentalEntity toEntity(CreateRentalItemUseCaseRequest request,
                                        Integer khataBookId){
        RentalEntity rentalEntity= new RentalEntity();
        rentalEntity.setKhataBookId(khataBookId);
        rentalEntity.setRentalItemName(request.rentalItemName());
        rentalEntity.setPhoneNumber(request.phoneNumber());
        rentalEntity.setAddress(request.address());
        rentalEntity.setRentalAmount(request.rentalAmount());
        rentalEntity.setRentalPeriod(request.rentalPeriod());
        rentalEntity.setStartDate(request.startDate());
        rentalEntity.setEndDate(request.endDate());
        rentalEntity.setRemarks(request.remarks());
        return rentalEntity;
    }

    public static GetRentalItemUseCaseResponse toResponse(RentalEntity rentalEntity){
        return new GetRentalItemUseCaseResponse(
                rentalEntity.getId(),
                rentalEntity.getRentalItemName(),
                rentalEntity.getPhoneNumber(),
                rentalEntity.getAddress(),
                rentalEntity.getRentalAmount(),
                rentalEntity.getRentalPeriod(),
                rentalEntity.getStartDate(),
                rentalEntity.getEndDate(),
                rentalEntity.getRemarks(),
                rentalEntity.getCreatedAt(),
                rentalEntity.getUpdatedAt()
        );
    }

    public static RentalEntity toEntityUpdate(UpdateRentalItemUseCaseRequest request,
                                              RentalEntity rentalEntity){

        rentalEntity.setRentalItemName(request.rentalItemName());
        rentalEntity.setPhoneNumber(request.phoneNumber());
        rentalEntity.setAddress(request.address());
        rentalEntity.setRentalAmount(request.rentalAmount());
        rentalEntity.setRentalPeriod(request.rentalPeriod());
        rentalEntity.setStartDate(request.startDate());
        rentalEntity.setEndDate(request.endDate());
        rentalEntity.setRemarks(request.remarks());
        return rentalEntity;
    }

}
