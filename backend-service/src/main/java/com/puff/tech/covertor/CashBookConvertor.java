package com.puff.tech.covertor;

import com.puff.tech.entity.CashBookEntity;
import com.puff.tech.usecase.cashbook.create.CreateCashBookUseCaseRequest;
import com.puff.tech.usecase.cashbook.update.UpdateCashBookUseCaseRequest;

import java.io.IOException;
import java.time.Instant;
import java.util.Base64;

public class CashBookConvertor {

    private CashBookConvertor(){}

    public static CashBookEntity toEntity(CreateCashBookUseCaseRequest req, Integer khataBookId) {
        CashBookEntity cashBookEntity = new CashBookEntity();

        cashBookEntity.setKhataBookId(Math.toIntExact(khataBookId));
        cashBookEntity.setCashBookNo(req.cashbookNo());
        cashBookEntity.setDate(req.date());
        cashBookEntity.setCategoryId(Math.toIntExact(req.categoryId()));
        cashBookEntity.setItemId(Math.toIntExact(req.itemId()));
        cashBookEntity.setPaymentMode(req.paymentMode());
        cashBookEntity.setAmount(req.amount());
        cashBookEntity.setRemarks(req.remarks());
        try {
            cashBookEntity.setPhotoPath(getImageBase64String(req.photo().getBytes()));
        }catch (IOException e) {
            throw new IllegalArgumentException("Cannot converted Image into Byte");
        }
        cashBookEntity.setCreatedAt(Instant.now());
        return cashBookEntity;
    }

    private static String getImageBase64String(byte[] src) {
        return Base64.getEncoder().encodeToString(src);
    }


    public static CashBookEntity updateEntity(CashBookEntity existing,
                                              UpdateCashBookUseCaseRequest request) {

        existing.setCashBookNo(request.cashbookNo());
        existing.setDate(request.date());
        existing.setCategoryId(Math.toIntExact(request.categoryId()));
        existing.setItemId(Math.toIntExact(request.itemId()));
        existing.setPaymentMode(request.paymentMode());
        existing.setAmount(request.amount());
        existing.setRemarks(request.remarks());
        try {
            existing.setPhotoPath(getImageBase64String(request.photo().getBytes()));
        }catch (IOException e) {
            throw new IllegalArgumentException("Cannot converted Image into Byte");
        }



        return existing;
    }
}
