package com.puff.tech.loanmanagement.usecase.calculate;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.converter.LoanScheduleDto;
import com.puff.tech.loanmanagement.repository.LoanScheduleEntity;
import com.puff.tech.loanmanagement.service.LoanCalculationService;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@Singleton
public class CalculateLoanEmiUseCase implements MonoUC<CalculateLoanEmiUseCaseRequest, CalculateLoanEmiUseCaseResponse> {

    private final LoanCalculationService calculationService;

    @Inject
    public CalculateLoanEmiUseCase(LoanCalculationService calculationService) {
        this.calculationService = calculationService;
    }

    @Override
    public Mono<CalculateLoanEmiUseCaseResponse> execute(CalculateLoanEmiUseCaseRequest request, UseCaseContext context) {
        return Mono.fromCallable(() -> {
            LocalDate startDate = request.startDate() != null ? request.startDate() : LocalDate.now();
            var result = calculationService.calculateEMI(
                    request.principalAmount(),
                    request.interestRate(),
                    request.tenureMonths(),
                    request.interestType()
            );

            List<LoanScheduleEntity> scheduleEntities = calculationService.generateAmortizationSchedule(
                    null,
                    request.principalAmount(),
                    request.interestRate(),
                    request.tenureMonths(),
                    startDate,
                    request.interestType()
            );

            List<LoanScheduleDto> scheduleDtos = scheduleEntities.stream()
                    .map(s -> new LoanScheduleDto(
                            s.getId(),
                            s.getLoanId(),
                            s.getInstallmentNo(),
                            s.getDueDate(),
                            s.getBeginningBalance(),
                            s.getEmiAmount(),
                            s.getPrincipalComponent(),
                            s.getInterestComponent(),
                            s.getEndingBalance(),
                            s.getStatus(),
                            s.getPaidDate(),
                            s.getPaidAmount()
                    ))
                    .toList();

            return new CalculateLoanEmiUseCaseResponse(
                    result.monthlyEmi(),
                    result.totalInterest(),
                    result.totalPayable(),
                    request.principalAmount(),
                    request.interestRate(),
                    request.tenureMonths(),
                    request.interestType(),
                    scheduleDtos
            );
        });
    }
}
