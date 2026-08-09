package com.puff.tech.covertor;

import com.puff.tech.entity.IncomeEntity;
import com.puff.tech.entity.ItemEntity;
import com.puff.tech.usecase.income.create.CreateIncomeUseCaseRequest;
import com.puff.tech.usecase.income.get.GetIncomeUseCaseResponse;
import com.puff.tech.usecase.income.update.UpdateIncomeUseCaseRequest;
import com.puff.tech.usecase.item.update.UpdateItemUseCaseRequest;
import io.micronaut.http.multipart.CompletedFileUpload;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Base64;

public class IncomeConvertor {
    private IncomeConvertor(){}

    public static IncomeEntity toEntity(CreateIncomeUseCaseRequest request,
                                        Integer khataBookId) {
        IncomeEntity incomeEntity = new IncomeEntity();
        incomeEntity.setKhataBookId(khataBookId);
        incomeEntity.setIncomeNo(request.incomeNo());
        incomeEntity.setDate(request.date());
        incomeEntity.setCategoryId(request.categoryId());
        incomeEntity.setItemId(request.itemId());
        incomeEntity.setPaymentMode(request.paymentMode());
        incomeEntity.setAmount(request.amount());
        incomeEntity.setRemarks(request.remarks());
        try {
            incomeEntity.setPhotoPath(getImageBase64String(request.photo().getBytes()));
        }catch (IOException e) {
            throw new IllegalArgumentException("Cannot converted Image into Byte");
        }
        return incomeEntity;
    }

    private static String getImageBase64String(byte[] src) {
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetIncomeUseCaseResponse getAllIncomeUseCaseResponse(IncomeEntity incomeEntity){
        return new GetIncomeUseCaseResponse(
                incomeEntity.getId(),
                incomeEntity.getIncomeNo(),
                incomeEntity.getDate(),
                incomeEntity.getCategoryId(),
                incomeEntity.getItemId(),
                incomeEntity.getPaymentMode(),
                incomeEntity.getAmount(),
                incomeEntity.getRemarks(),
                incomeEntity.getPhotoPath()
        );

    }
    public static IncomeEntity toUpdateEntity(IncomeEntity existing, UpdateIncomeUseCaseRequest request){
        existing.setIncomeNo(request.incomeNo());
        existing.setDate(request.date());
        existing.setCategoryId(request.categoryId());
        existing.setItemId(request.itemId());
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

