package com.puff.tech.loanmanagement.usecase.getall;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.converter.LoanConverter;
import com.puff.tech.loanmanagement.converter.LoanResponseDto;
import com.puff.tech.loanmanagement.repository.LoanRepository;
import com.puff.tech.loanmanagement.repository.LoanScheduleRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllLoansUseCase implements FluxUC<GetAllLoansUseCaseRequest, LoanResponseDto> {

    private final LoanRepository loanRepository;
    private final LoanScheduleRepository loanScheduleRepository;

    @Inject
    public GetAllLoansUseCase(LoanRepository loanRepository, LoanScheduleRepository loanScheduleRepository) {
        this.loanRepository = loanRepository;
        this.loanScheduleRepository = loanScheduleRepository;
    }

    @Override
    public Flux<LoanResponseDto> execute(GetAllLoansUseCaseRequest request, UseCaseContext context) {
        Long memberId = context.securityContext() != null ? context.securityContext().memberId() : null;
        if (memberId == null) {
            return Flux.error(new IllegalArgumentException("Member ID is required to fetch loans"));
        }

        return loanRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .flatMap(loan -> loanScheduleRepository.findByLoanIdOrderByInstallmentNoAsc(loan.getId())
                        .collectList()
                        .map(schedules -> LoanConverter.toResponseDto(loan, schedules)));
    }
}
