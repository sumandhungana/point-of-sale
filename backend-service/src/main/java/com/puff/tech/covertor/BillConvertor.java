package com.puff.tech.covertor;

import com.puff.tech.domain.BillStatus;
import com.puff.tech.entity.BillEntity;
import com.puff.tech.usecase.bill.create.CreateBillUseCaseRequest;
import com.puff.tech.usecase.bill.getall.GetAllBillUseCaseResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class BillConvertor {

    private BillConvertor(){}

    public static BillEntity toEntity(CreateBillUseCaseRequest request,Integer khataBookId){
        BillEntity billEntity= new BillEntity();
        billEntity.setKhataBookId(Long.valueOf(khataBookId));
        billEntity.setCustomerId(Long.valueOf(request.customerId()));
        billEntity.setBillDate(request.billDate());
        billEntity.setDueDate(request.dueDate());
        billEntity.setTotalAmount(request.totalAmount());
        billEntity.setPaidAmount(
                request.paidAmount() != null ? request.paidAmount() : BigDecimal.ZERO);
        billEntity.setStatus(String.valueOf(BillStatus.PAID));

        return billEntity;
    }


    public static GetAllBillUseCaseResponse toResponse(BillEntity bill){
        return new GetAllBillUseCaseResponse(
                bill.getBillId(),
                bill.getCustomerId(),
                bill.getBillDate(),
                bill.getDueDate(),
                bill.getTotalAmount(),
                bill.getPaidAmount(),
                bill.getStatus(),
                bill.getCreatedAt(),
                bill.getUpdatedAt()
        );
    }

}
