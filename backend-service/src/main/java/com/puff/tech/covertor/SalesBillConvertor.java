package com.puff.tech.covertor;

import com.puff.tech.entity.SalesBillEntity;
import com.puff.tech.usecase.salesbills.create.CreateSalesBillUseCaseRequest;
import com.puff.tech.usecase.salesbills.get.GetSalesBillUseCaseResponse;
import com.puff.tech.usecase.salesbills.update.UpdateSalesBillUseCaseRequest;

import java.util.Base64;

public class SalesBillConvertor {
    private SalesBillConvertor(){}

    public static SalesBillEntity toEntity(CreateSalesBillUseCaseRequest request,
                                           Integer khataBookId){
        SalesBillEntity salesBill= new SalesBillEntity();
        salesBill.setKhataBookId(khataBookId);
        salesBill.setBillNumber(request.billNumber());
        salesBill.setBillDate(request.billDate());
        salesBill.setCustomerId(request.customerId());
        salesBill.setPaymentMode(request.paymentMode());
        salesBill.setAmount(request.amount());
        salesBill.setRemarks(request.remarks());
        try{
            salesBill.setPhotoPath(getImageBase64String(request.photoPath().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return salesBill;
    }

    private static String getImageBase64String(byte[] src){
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetSalesBillUseCaseResponse toResponse(SalesBillEntity salesBillEntity){
        return new GetSalesBillUseCaseResponse(
                salesBillEntity.getId(),
                salesBillEntity.getBillNumber(),
                salesBillEntity.getBillDate(),
                salesBillEntity.getCustomerId(),
                salesBillEntity.getPaymentMode(),
                salesBillEntity.getAmount(),
                salesBillEntity.getRemarks(),
                salesBillEntity.getPhotoPath(),
                salesBillEntity.getCreatedAt(),
                salesBillEntity.getUpdatedAt()
        );
    }

    public static SalesBillEntity toEntityUpdate(UpdateSalesBillUseCaseRequest request,
                                                 SalesBillEntity salesBill){

        salesBill.setBillNumber(request.billNumber());
        salesBill.setBillDate(request.billDate());
        salesBill.setCustomerId(request.customerId());
        salesBill.setPaymentMode(request.paymentMode());
        salesBill.setAmount(request.amount());
        salesBill.setRemarks(request.remarks());
        try{
            salesBill.setPhotoPath(getImageBase64String(request.photoPath().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return salesBill;
    }
}
