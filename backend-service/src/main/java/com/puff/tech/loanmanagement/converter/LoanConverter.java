package com.puff.tech.loanmanagement.converter;

import com.puff.tech.loanmanagement.repository.LoanEntity;
import com.puff.tech.loanmanagement.repository.LoanScheduleEntity;
import com.puff.tech.loanmanagement.repository.LoanTransactionEntity;

import java.util.Collections;
import java.util.List;

public class LoanConverter {

    private LoanConverter() {}

    public static LoanScheduleDto toScheduleDto(LoanScheduleEntity entity) {
        if (entity == null) return null;
        return new LoanScheduleDto(
                entity.getId(),
                entity.getLoanId(),
                entity.getInstallmentNo(),
                entity.getDueDate(),
                entity.getBeginningBalance(),
                entity.getEmiAmount(),
                entity.getPrincipalComponent(),
                entity.getInterestComponent(),
                entity.getEndingBalance(),
                entity.getStatus(),
                entity.getPaidDate(),
                entity.getPaidAmount()
        );
    }

    public static LoanTransactionDto toTransactionDto(LoanTransactionEntity entity) {
        if (entity == null) return null;
        return new LoanTransactionDto(
                entity.getId(),
                entity.getLoanId(),
                entity.getTransactionDate(),
                entity.getType(),
                entity.getAmount(),
                entity.getPrincipalComponent(),
                entity.getInterestComponent(),
                entity.getPaymentMode(),
                entity.getReferenceNo(),
                entity.getRemarks(),
                entity.getBalanceAfter(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static LoanResponseDto toResponseDto(LoanEntity entity, List<LoanScheduleEntity> schedules) {
        if (entity == null) return null;
        List<LoanScheduleDto> scheduleDtos = schedules != null
                ? schedules.stream().map(LoanConverter::toScheduleDto).toList()
                : Collections.emptyList();

        return new LoanResponseDto(
                entity.getId(),
                entity.getLoanNumber(),
                entity.getLenderName(),
                entity.getLenderType(),
                entity.getPhoneNumber(),
                entity.getAccountNumber(),
                entity.getPrincipalAmount(),
                entity.getInterestRate(),
                entity.getTenureMonths(),
                entity.getInterestType(),
                entity.getStartDate(),
                entity.getMonthlyEmi(),
                entity.getTotalInterest(),
                entity.getTotalPayable(),
                entity.getTotalPaid(),
                entity.getRemainingBalance(),
                entity.getStatus(),
                entity.getPurpose(),
                entity.getRemarks(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                scheduleDtos
        );
    }
}
