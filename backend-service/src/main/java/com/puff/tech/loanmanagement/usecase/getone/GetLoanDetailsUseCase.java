package com.puff.tech.loanmanagement.usecase.getone;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.converter.LoanConverter;
import com.puff.tech.loanmanagement.converter.LoanTransactionDto;
import com.puff.tech.loanmanagement.repository.LoanRepository;
import com.puff.tech.loanmanagement.repository.LoanScheduleRepository;
import com.puff.tech.loanmanagement.repository.LoanTransactionRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.List;

@Singleton
public class GetLoanDetailsUseCase implements MonoUC<GetLoanDetailsUseCaseRequest, GetLoanDetailsUseCaseResponse> {

    private final LoanRepository loanRepository;
    private final LoanScheduleRepository loanScheduleRepository;
    private final LoanTransactionRepository loanTransactionRepository;

    @Inject
    public GetLoanDetailsUseCase(
            LoanRepository loanRepository,
            LoanScheduleRepository loanScheduleRepository,
            LoanTransactionRepository loanTransactionRepository
    ) {
        this.loanRepository = loanRepository;
        this.loanScheduleRepository = loanScheduleRepository;
        this.loanTransactionRepository = loanTransactionRepository;
    }

    @Override
    public Mono<GetLoanDetailsUseCaseResponse> execute(GetLoanDetailsUseCaseRequest request, UseCaseContext context) {
        Long memberId = context.securityContext() != null ? context.securityContext().memberId() : null;
        if (memberId == null) {
            return Mono.error(new IllegalArgumentException("Member ID is required"));
        }

        return loanRepository.findByIdAndMemberId(request.loanId(), memberId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Loan not found with id: " + request.loanId())))
                .flatMap(loan -> Mono.zip(
                        loanScheduleRepository.findByLoanIdOrderByInstallmentNoAsc(loan.getId()).collectList(),
                        loanTransactionRepository.findByLoanIdOrderByTransactionDateDesc(loan.getId()).collectList()
                ).map(tuple -> {
                    var schedules = tuple.getT1();
                    var transactions = tuple.getT2();
                    var loanDto = LoanConverter.toResponseDto(loan, schedules);
                    List<LoanTransactionDto> txDtos = transactions.stream()
                            .map(LoanConverter::toTransactionDto)
                            .toList();
                    return new GetLoanDetailsUseCaseResponse(loanDto, txDtos);
                }));
    }
}
