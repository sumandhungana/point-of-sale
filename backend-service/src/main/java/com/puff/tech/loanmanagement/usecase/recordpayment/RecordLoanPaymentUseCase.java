package com.puff.tech.loanmanagement.usecase.recordpayment;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.converter.LoanConverter;
import com.puff.tech.loanmanagement.repository.*;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Singleton
public class RecordLoanPaymentUseCase implements MonoUC<RecordLoanPaymentUseCaseRequest, RecordLoanPaymentUseCaseResponse> {

    private final LoanRepository loanRepository;
    private final LoanScheduleRepository loanScheduleRepository;
    private final LoanTransactionRepository loanTransactionRepository;

    @Inject
    public RecordLoanPaymentUseCase(
            LoanRepository loanRepository,
            LoanScheduleRepository loanScheduleRepository,
            LoanTransactionRepository loanTransactionRepository
    ) {
        this.loanRepository = loanRepository;
        this.loanScheduleRepository = loanScheduleRepository;
        this.loanTransactionRepository = loanTransactionRepository;
    }

    @Override
    public Mono<RecordLoanPaymentUseCaseResponse> execute(RecordLoanPaymentUseCaseRequest request, UseCaseContext context) {
        Long memberId = context.securityContext() != null ? context.securityContext().memberId() : null;
        if (memberId == null) {
            return Mono.error(new IllegalArgumentException("Member ID is required to record payment"));
        }

        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new IllegalArgumentException("Payment amount must be greater than zero"));
        }

        LocalDate paymentDate = request.paymentDate() != null ? request.paymentDate() : LocalDate.now();
        String type = request.type() != null ? request.type().trim().toUpperCase() : "PAYMENT_GIVEN";
        String paymentMode = request.paymentMode() != null ? request.paymentMode().trim().toUpperCase() : "BANK_TRANSFER";

        return loanRepository.findByIdAndMemberId(request.loanId(), memberId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Loan not found with id: " + request.loanId())))
                .flatMap(loan -> {
                    BigDecimal currentBalance = loan.getRemainingBalance() != null ? loan.getRemainingBalance() : BigDecimal.ZERO;
                    BigDecimal currentPaid = loan.getTotalPaid() != null ? loan.getTotalPaid() : BigDecimal.ZERO;
                    BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);

                    BigDecimal newBalance;
                    BigDecimal newPaid;

                    boolean isRepayment = "PAYMENT_GIVEN".equalsIgnoreCase(type);

                    if (isRepayment) {
                        newPaid = currentPaid.add(amount).setScale(2, RoundingMode.HALF_UP);
                        newBalance = currentBalance.subtract(amount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
                        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
                            loan.setStatus("CLOSED");
                        }
                    } else {
                        // Loan disbursement or additional borrowing
                        newPaid = currentPaid;
                        newBalance = currentBalance.add(amount).setScale(2, RoundingMode.HALF_UP);
                        loan.setStatus("ACTIVE");
                    }

                    loan.setRemainingBalance(newBalance);
                    loan.setTotalPaid(newPaid);

                    // Build transaction entity
                    LoanTransactionEntity tx = new LoanTransactionEntity();
                    tx.setLoanId(loan.getId());
                    MemberEntity member = new MemberEntity();
                    member.setId(memberId);
                    tx.setMember(member);
                    tx.setTransactionDate(paymentDate);
                    tx.setType(type);
                    tx.setAmount(amount);
                    tx.setPrincipalComponent(request.principalComponent() != null ? request.principalComponent() : amount);
                    tx.setInterestComponent(request.interestComponent() != null ? request.interestComponent() : BigDecimal.ZERO);
                    tx.setPaymentMode(paymentMode);
                    tx.setReferenceNo(request.referenceNo());
                    tx.setRemarks(request.remarks());
                    tx.setBalanceAfter(newBalance);

                    Mono<Void> updateSchedulesMono;
                    if (isRepayment) {
                        updateSchedulesMono = loanScheduleRepository.findByLoanIdAndStatusOrderByInstallmentNoAsc(loan.getId(), "PENDING")
                                .collectList()
                                .flatMap(pendingSchedules -> {
                                    BigDecimal unallocated = amount;
                                    List<LoanScheduleEntity> toUpdate = new ArrayList<>();
                                    for (LoanScheduleEntity item : pendingSchedules) {
                                        if (unallocated.compareTo(item.getEmiAmount()) >= 0) {
                                            unallocated = unallocated.subtract(item.getEmiAmount());
                                            item.setStatus("PAID");
                                            item.setPaidDate(paymentDate);
                                            item.setPaidAmount(item.getEmiAmount());
                                            toUpdate.add(item);
                                        } else {
                                            break;
                                        }
                                    }
                                    if (!toUpdate.isEmpty()) {
                                        return loanScheduleRepository.updateAll(toUpdate).then();
                                    }
                                    return Mono.empty();
                                });
                    } else {
                        updateSchedulesMono = Mono.empty();
                    }

                    return updateSchedulesMono
                            .then(loanRepository.update(loan))
                            .flatMap(savedLoan -> loanTransactionRepository.save(tx)
                                    .flatMap(savedTx -> loanScheduleRepository.findByLoanIdOrderByInstallmentNoAsc(savedLoan.getId())
                                            .collectList()
                                            .map(schedules -> {
                                                var loanDto = LoanConverter.toResponseDto(savedLoan, schedules);
                                                var txDto = LoanConverter.toTransactionDto(savedTx);
                                                return new RecordLoanPaymentUseCaseResponse(
                                                        "Loan transaction recorded successfully",
                                                        loanDto,
                                                        txDto
                                                );
                                            })));
                });
    }
}
