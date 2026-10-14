package com.puff.tech.loanmanagement.service;

import com.puff.tech.loanmanagement.repository.LoanScheduleEntity;
import jakarta.inject.Singleton;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Singleton
public class LoanCalculationService {

    public record EmiCalculationResult(
            BigDecimal monthlyEmi,
            BigDecimal totalInterest,
            BigDecimal totalPayable
    ) {}

    /**
     * Calculates Monthly EMI, Total Interest, and Total Payable.
     */
    public EmiCalculationResult calculateEMI(
            BigDecimal principal,
            BigDecimal annualRate,
            Integer tenureMonths,
            String interestType
    ) {
        if (principal == null || principal.compareTo(BigDecimal.ZERO) <= 0 ||
                tenureMonths == null || tenureMonths <= 0) {
            return new EmiCalculationResult(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }

        BigDecimal rate = annualRate != null ? annualRate : BigDecimal.ZERO;
        String type = interestType != null ? interestType.trim().toUpperCase() : "REDUCING";

        if ("FLAT".equalsIgnoreCase(type)) {
            // Flat Interest Calculation
            // Total Interest = (P * R * T_years) / 100
            BigDecimal years = BigDecimal.valueOf(tenureMonths).divide(BigDecimal.valueOf(12), 8, RoundingMode.HALF_UP);
            BigDecimal totalInterest = principal.multiply(rate).multiply(years)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal totalPayable = principal.add(totalInterest).setScale(2, RoundingMode.HALF_UP);
            BigDecimal monthlyEmi = totalPayable.divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);

            return new EmiCalculationResult(monthlyEmi, totalInterest, totalPayable);
        } else {
            // Reducing Balance (Standard Banking EMI)
            // monthlyRate = (R / 12) / 100
            double annualRateDouble = rate.doubleValue();
            double monthlyRateDouble = annualRateDouble / 12.0 / 100.0;

            if (monthlyRateDouble == 0) {
                BigDecimal monthlyEmi = principal.divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);
                return new EmiCalculationResult(
                        monthlyEmi,
                        BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                        principal.setScale(2, RoundingMode.HALF_UP)
                );
            }

            double p = principal.doubleValue();
            int n = tenureMonths;
            double factor = Math.pow(1.0 + monthlyRateDouble, n);
            double emiDouble = (p * monthlyRateDouble * factor) / (factor - 1.0);

            BigDecimal monthlyEmi = BigDecimal.valueOf(emiDouble).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalPayable = monthlyEmi.multiply(BigDecimal.valueOf(n)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalInterest = totalPayable.subtract(principal).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

            return new EmiCalculationResult(monthlyEmi, totalInterest, totalPayable);
        }
    }

    /**
     * Generates Amortization Schedule items.
     */
    public List<LoanScheduleEntity> generateAmortizationSchedule(
            Long loanId,
            BigDecimal principal,
            BigDecimal annualRate,
            Integer tenureMonths,
            LocalDate startDate,
            String interestType
    ) {
        EmiCalculationResult calc = calculateEMI(principal, annualRate, tenureMonths, interestType);
        List<LoanScheduleEntity> schedule = new ArrayList<>();

        if (tenureMonths == null || tenureMonths <= 0 || principal == null) {
            return schedule;
        }

        String type = interestType != null ? interestType.trim().toUpperCase() : "REDUCING";
        double monthlyRateDouble = (annualRate != null ? annualRate.doubleValue() : 0.0) / 12.0 / 100.0;
        BigDecimal monthlyRateBd = BigDecimal.valueOf(monthlyRateDouble);

        BigDecimal balance = principal.setScale(2, RoundingMode.HALF_UP);
        LocalDate start = startDate != null ? startDate : LocalDate.now();

        for (int i = 1; i <= tenureMonths; i++) {
            LocalDate dueDate = start.plusMonths(i);

            BigDecimal interestPart;
            BigDecimal principalPart;

            if ("FLAT".equalsIgnoreCase(type)) {
                interestPart = calc.totalInterest()
                        .divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);
                principalPart = calc.monthlyEmi().subtract(interestPart).setScale(2, RoundingMode.HALF_UP);
            } else {
                interestPart = balance.multiply(monthlyRateBd).setScale(2, RoundingMode.HALF_UP);
                principalPart = calc.monthlyEmi().subtract(interestPart).setScale(2, RoundingMode.HALF_UP);
            }

            // On last installment or if principal exceeds remaining balance
            if (i == tenureMonths || principalPart.compareTo(balance) > 0) {
                principalPart = balance;
            }

            BigDecimal endingBalance = balance.subtract(principalPart).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal emiAmount = principalPart.add(interestPart).setScale(2, RoundingMode.HALF_UP);

            LoanScheduleEntity item = new LoanScheduleEntity();
            item.setLoanId(loanId);
            item.setInstallmentNo(i);
            item.setDueDate(dueDate);
            item.setBeginningBalance(balance);
            item.setEmiAmount(emiAmount);
            item.setPrincipalComponent(principalPart);
            item.setInterestComponent(interestPart);
            item.setEndingBalance(endingBalance);
            item.setStatus("PENDING");

            schedule.add(item);
            balance = endingBalance;

            if (balance.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
        }

        return schedule;
    }
}
