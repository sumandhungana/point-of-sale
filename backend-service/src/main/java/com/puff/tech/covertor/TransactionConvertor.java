package com.puff.tech.covertor;

import com.puff.tech.entity.TransactionEntity;
import com.puff.tech.usecase.transaction.create.CreateTransactionUseCaseRequest;
import com.puff.tech.usecase.transaction.get.GetTransactionUseCaseResponse;
import com.puff.tech.usecase.transaction.update.UpdateTransactionUseCaseRequest;

public class TransactionConvertor {
    private TransactionConvertor(){}

    public static TransactionEntity toEntity(CreateTransactionUseCaseRequest request,
                                             Integer khataBookId){
        TransactionEntity transaction= new TransactionEntity();
        transaction.setKhataBookId(khataBookId);
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setTransactionType(request.transactionType());
        return transaction;
    }

    public static GetTransactionUseCaseResponse toResponse(TransactionEntity transactionEntity){
        return new GetTransactionUseCaseResponse(
                transactionEntity.getId(),
                transactionEntity.getDescription(),
                transactionEntity.getAmount(),
                transactionEntity.getTransactionDate(),
                transactionEntity.getTransactionType(),
                transactionEntity.getCreatedAt(),
                transactionEntity.getUpdatedAt()
        );
    }

    public static TransactionEntity toEntityUpdate(UpdateTransactionUseCaseRequest request,
                                             TransactionEntity transaction){

        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setTransactionType(request.transactionType());
        return transaction;
    }
}
