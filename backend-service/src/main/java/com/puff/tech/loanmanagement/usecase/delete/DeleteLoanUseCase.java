package com.puff.tech.loanmanagement.usecase.delete;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.repository.LoanRepository;
import com.puff.tech.loanmanagement.repository.LoanScheduleRepository;
import com.puff.tech.loanmanagement.repository.LoanTransactionRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteLoanUseCase implements MonoUC<DeleteLoanUseCaseRequest, DeleteLoanUseCaseResponse> {

    private final LoanRepository loanRepository;
    private final LoanScheduleRepository loanScheduleRepository;
    private final LoanTransactionRepository loanTransactionRepository;

    @Inject
    public DeleteLoanUseCase(
            LoanRepository loanRepository,
            LoanScheduleRepository loanScheduleRepository,
            LoanTransactionRepository loanTransactionRepository
    ) {
        this.loanRepository = loanRepository;
        this.loanScheduleRepository = loanScheduleRepository;
        this.loanTransactionRepository = loanTransactionRepository;
    }

    @Override
    public Mono<DeleteLoanUseCaseResponse> execute(DeleteLoanUseCaseRequest request, UseCaseContext context) {
        Long memberId = context.securityContext() != null ? context.securityContext().memberId() : null;
        if (memberId == null) {
            return Mono.error(new IllegalArgumentException("Member ID is required"));
        }

        return loanRepository.existsByIdAndMemberId(request.loanId(), memberId)
                .flatMap(exists -> {
                    if (!exists) {
                        return Mono.error(new IllegalArgumentException("Loan not found with id: " + request.loanId()));
                    }
                    return loanTransactionRepository.deleteByLoanId(request.loanId())
                            .then(loanScheduleRepository.deleteByLoanId(request.loanId()))
                            .then(loanRepository.deleteByIdAndMemberId(request.loanId(), memberId))
                            .map(deleted -> new DeleteLoanUseCaseResponse("Loan deleted successfully", request.loanId()));
                });
    }
}
