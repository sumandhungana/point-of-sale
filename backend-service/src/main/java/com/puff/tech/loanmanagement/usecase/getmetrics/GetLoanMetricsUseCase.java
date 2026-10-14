package com.puff.tech.loanmanagement.usecase.getmetrics;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.repository.LoanEntity;
import com.puff.tech.loanmanagement.repository.LoanRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Singleton
public class GetLoanMetricsUseCase implements MonoUC<GetLoanMetricsUseCaseRequest, GetLoanMetricsUseCaseResponse> {

    private final LoanRepository loanRepository;

    @Inject
    public GetLoanMetricsUseCase(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    @Override
    public Mono<GetLoanMetricsUseCaseResponse> execute(GetLoanMetricsUseCaseRequest request, UseCaseContext context) {
        Long memberId = context.securityContext() != null ? context.securityContext().memberId() : null;
        if (memberId == null) {
            return Mono.error(new IllegalArgumentException("Member ID is required"));
        }

        return loanRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .collectList()
                .map(loans -> {
                    BigDecimal totalBorrowed = BigDecimal.ZERO;
                    BigDecimal totalRepaid = BigDecimal.ZERO;
                    BigDecimal totalOutstanding = BigDecimal.ZERO;
                    BigDecimal totalMonthlyEmi = BigDecimal.ZERO;
                    long totalCount = loans.size();
                    long activeCount = 0;
                    long closedCount = 0;

                    for (LoanEntity loan : loans) {
                        if (loan.getPrincipalAmount() != null) {
                            totalBorrowed = totalBorrowed.add(loan.getPrincipalAmount());
                        }
                        if (loan.getTotalPaid() != null) {
                            totalRepaid = totalRepaid.add(loan.getTotalPaid());
                        }
                        if (loan.getRemainingBalance() != null) {
                            totalOutstanding = totalOutstanding.add(loan.getRemainingBalance());
                        }

                        if ("ACTIVE".equalsIgnoreCase(loan.getStatus())) {
                            activeCount++;
                            if (loan.getMonthlyEmi() != null) {
                                totalMonthlyEmi = totalMonthlyEmi.add(loan.getMonthlyEmi());
                            }
                        } else if ("CLOSED".equalsIgnoreCase(loan.getStatus())) {
                            closedCount++;
                        }
                    }

                    return new GetLoanMetricsUseCaseResponse(
                            totalBorrowed.setScale(2, RoundingMode.HALF_UP),
                            totalRepaid.setScale(2, RoundingMode.HALF_UP),
                            totalOutstanding.setScale(2, RoundingMode.HALF_UP),
                            totalMonthlyEmi.setScale(2, RoundingMode.HALF_UP),
                            totalCount,
                            activeCount,
                            closedCount
                    );
                });
    }
}
