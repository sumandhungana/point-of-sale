package com.puff.tech.loanmanagement.usecase.update;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.loanmanagement.converter.LoanConverter;
import com.puff.tech.loanmanagement.repository.LoanRepository;
import com.puff.tech.loanmanagement.repository.LoanScheduleRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateLoanUseCase implements MonoUC<UpdateLoanUseCaseRequest, UpdateLoanUseCaseResponse> {

    private final LoanRepository loanRepository;
    private final LoanScheduleRepository loanScheduleRepository;

    @Inject
    public UpdateLoanUseCase(LoanRepository loanRepository, LoanScheduleRepository loanScheduleRepository) {
        this.loanRepository = loanRepository;
        this.loanScheduleRepository = loanScheduleRepository;
    }

    @Override
    public Mono<UpdateLoanUseCaseResponse> execute(UpdateLoanUseCaseRequest request, UseCaseContext context) {
        Long memberId = context.securityContext() != null ? context.securityContext().memberId() : null;
        if (memberId == null) {
            return Mono.error(new IllegalArgumentException("Member ID is required"));
        }

        return loanRepository.findByIdAndMemberId(request.loanId(), memberId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Loan not found with id: " + request.loanId())))
                .flatMap(loan -> {
                    if (request.lenderName() != null && !request.lenderName().isBlank()) {
                        loan.setLenderName(request.lenderName().trim());
                    }
                    if (request.lenderType() != null && !request.lenderType().isBlank()) {
                        loan.setLenderType(request.lenderType().trim().toUpperCase());
                    }
                    if (request.phoneNumber() != null) {
                        loan.setPhoneNumber(request.phoneNumber().trim());
                    }
                    if (request.accountNumber() != null) {
                        loan.setAccountNumber(request.accountNumber().trim());
                    }
                    if (request.purpose() != null) {
                        loan.setPurpose(request.purpose().trim());
                    }
                    if (request.remarks() != null) {
                        loan.setRemarks(request.remarks().trim());
                    }
                    if (request.status() != null && !request.status().isBlank()) {
                        loan.setStatus(request.status().trim().toUpperCase());
                    }

                    return loanRepository.update(loan);
                })
                .flatMap(updatedLoan -> loanScheduleRepository.findByLoanIdOrderByInstallmentNoAsc(updatedLoan.getId())
                        .collectList()
                        .map(schedules -> {
                            var loanDto = LoanConverter.toResponseDto(updatedLoan, schedules);
                            return new UpdateLoanUseCaseResponse("Loan updated successfully", loanDto);
                        }));
    }
}
