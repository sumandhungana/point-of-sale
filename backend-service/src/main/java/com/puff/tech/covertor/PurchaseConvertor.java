package com.puff.tech.covertor;

import com.puff.tech.entity.PurchaseEntity;
import com.puff.tech.usecase.purchase.create.CreatePurchaseUseCaseRequest;
import com.puff.tech.usecase.purchase.get.GetPurchaseUseCaseResponse;
import com.puff.tech.usecase.purchase.update.UpdatePurchaseUseCaseRequest;

import java.util.Base64;

public class PurchaseConvertor {
    private PurchaseConvertor(){}

    public static PurchaseEntity toEntity(CreatePurchaseUseCaseRequest request,
                                          Integer khataBookId){
        PurchaseEntity purchaseEntity= new PurchaseEntity();
        purchaseEntity.setKhataBookId(khataBookId);
        purchaseEntity.setPurchaseNo(request.purchaseNo());
        purchaseEntity.setDate(request.date());
        purchaseEntity.setCategoryId(request.categoryId());
        purchaseEntity.setItemId(request.itemId());
        purchaseEntity.setPaymentMode(request.paymentMode());
        purchaseEntity.setAmount(request.amount());
        purchaseEntity.setRemarks(request.remarks());
        try {
            purchaseEntity.setPhotoPath(getImageBase64String(request.photoPath().getBytes()));
        }catch (Exception e){
            throw new IllegalArgumentException("Cannot convert to bytes");
        }
        return purchaseEntity;
    }
    private static String getImageBase64String(byte[] src) {
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetPurchaseUseCaseResponse toResponse(PurchaseEntity purchaseEntity){
        return new GetPurchaseUseCaseResponse(
                purchaseEntity.getId(),
                purchaseEntity.getKhataBookId(),
                purchaseEntity.getKhataBook(),
                purchaseEntity.getPurchaseNo(),
                purchaseEntity.getDate(),
                purchaseEntity.getCategoryId(),
                purchaseEntity.getItemId(),
                purchaseEntity.getPaymentMode(),
                purchaseEntity.getAmount(),
                purchaseEntity.getRemarks(),
                purchaseEntity.getPhotoPath(),
                purchaseEntity.getCreatedAt(),
                purchaseEntity.getCategory(),
                purchaseEntity.getItem()
        );
    }

    public static PurchaseEntity toEntityUpdate(UpdatePurchaseUseCaseRequest request,
                                                PurchaseEntity purchaseEntity){

        purchaseEntity.setPurchaseNo(request.purchaseNo());
        purchaseEntity.setDate(request.date());
        purchaseEntity.setCategoryId(request.categoryId());
        purchaseEntity.setItemId(request.itemId());
        purchaseEntity.setPaymentMode(request.paymentMode());
        purchaseEntity.setAmount(request.amount());
        purchaseEntity.setRemarks(request.remarks());
        try {
            purchaseEntity.setPhotoPath(getImageBase64String(request.photoPath().getBytes()));
        }catch (Exception e){
            throw new IllegalArgumentException("Cannot convert to bytes");
        }
        return purchaseEntity;
    }

}
