package com.puff.tech.covertor;

import com.puff.tech.entity.ExpensesEntity;
import com.puff.tech.usecase.expenses.create.CreateExpensesUseCaseRequest;
import com.puff.tech.usecase.expenses.getall.GetAllExpensesBookUseCaseResponse;
import com.puff.tech.usecase.expenses.update.UpdateExpensesUseCaseRequest;

import java.time.Instant;
import java.util.Base64;

public class ExpensesConvertor {
    private ExpensesConvertor(){}

    public static ExpensesEntity toEntity(CreateExpensesUseCaseRequest request,
                                          Integer khataBookId){
        ExpensesEntity expenses= new ExpensesEntity();
        expenses.setKhataBookId(khataBookId);
        expenses.setExpensesNo(request.expensesNo());
        expenses.setDate(request.date());
        expenses.setCategoryId(request.categoryId());
        expenses.setItemId(request.itemId());
        expenses.setPaymentMode(request.paymentMode());
        expenses.setAmount(request.amount());
        try {
            expenses.setPhotoPath(getImageBase64String(request.photoPath().getBytes()));
        }catch (Exception e){
            throw new IllegalArgumentException("Cannot convert to bytes");
        }
        expenses.setRemarks(request.remarks());
        expenses.setCreatedAt(Instant.now());
        return expenses;
    }

    private static String getImageBase64String(byte[] src) {
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetAllExpensesBookUseCaseResponse response(ExpensesEntity expenses){
        return new GetAllExpensesBookUseCaseResponse(
                expenses.getId(),
                expenses.getExpensesNo(),
                expenses.getDate(),
                expenses.getCategoryId(),
                expenses.getItemId(),
                expenses.getPaymentMode(),
                expenses.getAmount(),
                expenses.getRemarks(),
                expenses.getPhotoPath(),
                expenses.getCreatedAt()
        );
    }

    public static ExpensesEntity toEntityForUpdate(ExpensesEntity existing,
                                                   UpdateExpensesUseCaseRequest request) {

        existing.setExpensesNo(request.expensesNo());
        existing.setDate(request.date());
        existing.setCategoryId(request.categoryId());
        existing.setItemId(request.itemId());
        existing.setPaymentMode(request.paymentMode());
        existing.setAmount(request.amount());
        existing.setRemarks(request.remarks());
        try {
            existing.setPhotoPath(getImageBase64String(request.photo().getBytes()));
        }catch (Exception e){
            throw new IllegalArgumentException("Cannot convert to bytes");
        }

        return existing;
    }

}

