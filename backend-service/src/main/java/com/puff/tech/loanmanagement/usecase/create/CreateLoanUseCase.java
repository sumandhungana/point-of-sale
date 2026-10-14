package com.puff.tech.loanmanagement.usecase.create;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.converter.LoanConverter;
import com.puff.tech.loanmanagement.repository.*;
import com.puff.tech.loanmanagement.service.LoanCalculationService;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Singleton
public class CreateLoanUseCase implements MonoUC<CreateLoanUseCaseRequest, CreateLoanUseCaseResponse> {

    private final LoanRepository loanRepository;
    private final LoanScheduleRepository loanScheduleRepository;
    private final LoanTransactionRepository loanTransactionRepository;
    private final LoanCalculationService calculationService;

    @Inject
    public CreateLoanUseCase(
            LoanRepository loanRepository,
            LoanScheduleRepository loanScheduleRepository,
            LoanTransactionRepository loanTransactionRepository,
            LoanCalculationService calculationService
    ) {
        this.loanRepository = loanRepository;
        this.loanScheduleRepository = loanScheduleRepository;
        this.loanTransactionRepository = loanTransactionRepository;
        this.calculationService = calculationService;
    }

    @Override
    public Mono<CreateLoanUseCaseResponse> execute(CreateLoanUseCaseRequest request, UseCaseContext context) {
        Long memberId = context.securityContext() != null ? context.securityContext().memberId() : null;
        if (memberId == null) {
            return Mono.error(new IllegalArgumentException("Member ID is required to create a loan"));
        }

        LocalDate startDate = request.startDate() != null ? request.startDate() : LocalDate.now();
        var calc = calculationService.calculateEMI(
                request.principalAmount(),
                request.interestRate(),
                request.tenureMonths(),
                request.interestType()
        );

        return loanRepository.countByMemberId(memberId)
                .defaultIfEmpty(0L)
                .flatMap(count -> {
                    String generatedLoanNumber = request.loanNumber();
                    if (generatedLoanNumber == null || generatedLoanNumber.trim().isEmpty()) {
                        generatedLoanNumber = String.format("LN-%d-%03d", startDate.getYear(), count + 1);
                    }

                    LoanEntity loan = new LoanEntity();
                    MemberEntity member = new MemberEntity();
                    member.setId(memberId);
                    loan.setMember(member);

                    loan.setLoanNumber(generatedLoanNumber);
                    loan.setLenderName(request.lenderName());
                    loan.setLenderType(request.lenderType() != null ? request.lenderType().toUpperCase() : "OTHER");
                    loan.setPhoneNumber(request.phoneNumber());
                    loan.setAccountNumber(request.accountNumber());
                    loan.setPrincipalAmount(request.principalAmount());
                    loan.setInterestRate(request.interestRate());
                    loan.setTenureMonths(request.tenureMonths());
                    loan.setInterestType(request.interestType() != null ? request.interestType().toUpperCase() : "REDUCING");
                    loan.setStartDate(startDate);
                    loan.setMonthlyEmi(calc.monthlyEmi());
                    loan.setTotalInterest(calc.totalInterest());
                    loan.setTotalPayable(calc.totalPayable());
                    loan.setTotalPaid(BigDecimal.ZERO);
                    loan.setRemainingBalance(calc.totalPayable());
                    loan.setStatus("ACTIVE");
                    loan.setPurpose(request.purpose());
                    loan.setRemarks(request.remarks());

                    return loanRepository.save(loan);
                })
                .flatMap(savedLoan -> {
                    // Generate schedule
                    List<LoanScheduleEntity> scheduleEntities = calculationService.generateAmortizationSchedule(
                            savedLoan.getId(),
                            savedLoan.getPrincipalAmount(),
                            savedLoan.getInterestRate(),
                            savedLoan.getTenureMonths(),
                            savedLoan.getStartDate(),
                            savedLoan.getInterestType()
                    );

                    // Initial disbursement transaction
                    LoanTransactionEntity initTx = new LoanTransactionEntity();
                    initTx.setLoanId(savedLoan.getId());
                    MemberEntity member = new MemberEntity();
                    member.setId(memberId);
                    initTx.setMember(member);
                    initTx.setTransactionDate(savedLoan.getStartDate());
                    initTx.setType("PAYMENT_RECEIVED");
                    initTx.setAmount(savedLoan.getPrincipalAmount());
                    initTx.setPrincipalComponent(savedLoan.getPrincipalAmount());
                    initTx.setInterestComponent(BigDecimal.ZERO);
                    initTx.setPaymentMode("BANK_TRANSFER");
                    initTx.setReferenceNo("DISBURSAL-INIT");
                    initTx.setRemarks("Initial loan disbursement for " + savedLoan.getLoanNumber());
                    initTx.setBalanceAfter(savedLoan.getTotalPayable());

                    return loanScheduleRepository.saveAll(scheduleEntities)
                            .collectList()
                            .flatMap(savedSchedules -> loanTransactionRepository.save(initTx)
                                    .thenReturn(savedSchedules))
                            .map(savedSchedules -> {
                                var loanDto = LoanConverter.toResponseDto(savedLoan, savedSchedules);
                                return new CreateLoanUseCaseResponse("Loan created successfully", savedLoan.getId(), loanDto);
                            });
                })
                .onErrorResume(err -> Mono.error(new RuntimeException("Failed to create loan: " + err.getMessage(), err)));
    }
}
