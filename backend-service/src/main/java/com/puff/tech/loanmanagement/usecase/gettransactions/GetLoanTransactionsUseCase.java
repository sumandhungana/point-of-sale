package com.puff.tech.loanmanagement.usecase.gettransactions;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.converter.LoanConverter;
import com.puff.tech.loanmanagement.converter.LoanTransactionDto;
import com.puff.tech.loanmanagement.repository.LoanTransactionRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetLoanTransactionsUseCase implements FluxUC<GetLoanTransactionsUseCaseRequest, LoanTransactionDto> {

    private final LoanTransactionRepository loanTransactionRepository;

    @Inject
    public GetLoanTransactionsUseCase(LoanTransactionRepository loanTransactionRepository) {
        this.loanTransactionRepository = loanTransactionRepository;
    }

    @Override
    public Flux<LoanTransactionDto> execute(GetLoanTransactionsUseCaseRequest request, UseCaseContext context) {
        Long memberId = context.securityContext() != null ? context.securityContext().memberId() : null;
        if (memberId == null) {
            return Flux.error(new IllegalArgumentException("Member ID is required"));
        }

        if (request != null && request.loanId() != null) {
            return loanTransactionRepository.findByLoanIdOrderByTransactionDateDesc(request.loanId())
                    .map(LoanConverter::toTransactionDto);
        } else {
            return loanTransactionRepository.findByMemberIdOrderByTransactionDateDesc(memberId)
                    .map(LoanConverter::toTransactionDto);
        }
    }
}
