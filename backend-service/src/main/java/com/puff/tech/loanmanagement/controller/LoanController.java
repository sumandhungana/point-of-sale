package com.puff.tech.loanmanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import com.puff.tech.loanmanagement.converter.LoanResponseDto;
import com.puff.tech.loanmanagement.converter.LoanTransactionDto;
import com.puff.tech.loanmanagement.usecase.calculate.CalculateLoanEmiUseCase;
import com.puff.tech.loanmanagement.usecase.calculate.CalculateLoanEmiUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.calculate.CalculateLoanEmiUseCaseResponse;
import com.puff.tech.loanmanagement.usecase.create.CreateLoanUseCase;
import com.puff.tech.loanmanagement.usecase.create.CreateLoanUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.create.CreateLoanUseCaseResponse;
import com.puff.tech.loanmanagement.usecase.delete.DeleteLoanUseCase;
import com.puff.tech.loanmanagement.usecase.delete.DeleteLoanUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.delete.DeleteLoanUseCaseResponse;
import com.puff.tech.loanmanagement.usecase.getall.GetAllLoansUseCase;
import com.puff.tech.loanmanagement.usecase.getall.GetAllLoansUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.getmetrics.GetLoanMetricsUseCase;
import com.puff.tech.loanmanagement.usecase.getmetrics.GetLoanMetricsUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.getmetrics.GetLoanMetricsUseCaseResponse;
import com.puff.tech.loanmanagement.usecase.getone.GetLoanDetailsUseCase;
import com.puff.tech.loanmanagement.usecase.getone.GetLoanDetailsUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.getone.GetLoanDetailsUseCaseResponse;
import com.puff.tech.loanmanagement.usecase.gettransactions.GetLoanTransactionsUseCase;
import com.puff.tech.loanmanagement.usecase.gettransactions.GetLoanTransactionsUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.recordpayment.RecordLoanPaymentUseCase;
import com.puff.tech.loanmanagement.usecase.recordpayment.RecordLoanPaymentUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.recordpayment.RecordLoanPaymentUseCaseResponse;
import com.puff.tech.loanmanagement.usecase.update.UpdateLoanUseCase;
import com.puff.tech.loanmanagement.usecase.update.UpdateLoanUseCaseRequest;
import com.puff.tech.loanmanagement.usecase.update.UpdateLoanUseCaseResponse;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("/loans")
public class LoanController {

    private final CalculateLoanEmiUseCase calculateLoanEmiUseCase;
    private final CreateLoanUseCase createLoanUseCase;
    private final GetAllLoansUseCase getAllLoansUseCase;
    private final GetLoanDetailsUseCase getLoanDetailsUseCase;
    private final UpdateLoanUseCase updateLoanUseCase;
    private final DeleteLoanUseCase deleteLoanUseCase;
    private final RecordLoanPaymentUseCase recordLoanPaymentUseCase;
    private final GetLoanTransactionsUseCase getLoanTransactionsUseCase;
    private final GetLoanMetricsUseCase getLoanMetricsUseCase;

    @Inject
    public LoanController(
            CalculateLoanEmiUseCase calculateLoanEmiUseCase,
            CreateLoanUseCase createLoanUseCase,
            GetAllLoansUseCase getAllLoansUseCase,
            GetLoanDetailsUseCase getLoanDetailsUseCase,
            UpdateLoanUseCase updateLoanUseCase,
            DeleteLoanUseCase deleteLoanUseCase,
            RecordLoanPaymentUseCase recordLoanPaymentUseCase,
            GetLoanTransactionsUseCase getLoanTransactionsUseCase,
            GetLoanMetricsUseCase getLoanMetricsUseCase
    ) {
        this.calculateLoanEmiUseCase = calculateLoanEmiUseCase;
        this.createLoanUseCase = createLoanUseCase;
        this.getAllLoansUseCase = getAllLoansUseCase;
        this.getLoanDetailsUseCase = getLoanDetailsUseCase;
        this.updateLoanUseCase = updateLoanUseCase;
        this.deleteLoanUseCase = deleteLoanUseCase;
        this.recordLoanPaymentUseCase = recordLoanPaymentUseCase;
        this.getLoanTransactionsUseCase = getLoanTransactionsUseCase;
        this.getLoanMetricsUseCase = getLoanMetricsUseCase;
    }

    /**
     * Financial Calculation & Simulation Endpoint (EMI and Amortization Schedule).
     * Can be invoked without persisting to calculate loan parameters in real-time on the backend.
     */
    @Secured(permissions = {Permission.LOAN_CREATE, Permission.LOAN_FIND_ALL})
    @Post("/calculate")
    public Mono<RestResponse<CalculateLoanEmiUseCaseResponse>> calculate(@Body CalculateLoanEmiUseCaseRequest request) {
        return calculateLoanEmiUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Calculation failed: " + err.getMessage())));
    }

    /**
     * Create a new loan with backend-calculated EMI and amortization schedule.
     */
    @Secured(permissions = {Permission.LOAN_CREATE})
    @Post()
    public Mono<RestResponse<CreateLoanUseCaseResponse>> create(@Body CreateLoanUseCaseRequest request) {
        return createLoanUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to create loan: " + err.getMessage())));
    }

    /**
     * Retrieve all loans for the authenticated member.
     */
    @Secured(permissions = {Permission.LOAN_FIND_ALL})
    @Get()
    public Mono<RestResponse<List<LoanResponseDto>>> getAll() {
        return getAllLoansUseCase.execute(new GetAllLoansUseCaseRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to fetch loans: " + err.getMessage())));
    }

    /**
     * Retrieve aggregate KPI metrics for all loans (Total Borrowed, Repaid, Outstanding, Monthly EMI).
     */
    @Secured(permissions = {Permission.LOAN_METRICS, Permission.LOAN_FIND_ALL})
    @Get("/metrics")
    public Mono<RestResponse<GetLoanMetricsUseCaseResponse>> getMetrics() {
        return getLoanMetricsUseCase.execute(new GetLoanMetricsUseCaseRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to fetch metrics: " + err.getMessage())));
    }

    /**
     * Retrieve all loan transactions for the authenticated member.
     */
    @Secured(permissions = {Permission.LOAN_PAYMENT, Permission.LOAN_FIND_ALL})
    @Get("/transactions")
    public Mono<RestResponse<List<LoanTransactionDto>>> getAllTransactions() {
        return getLoanTransactionsUseCase.execute(new GetLoanTransactionsUseCaseRequest(null))
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to fetch transactions: " + err.getMessage())));
    }

    /**
     * Retrieve a single loan by ID with its full schedule and transaction history.
     */
    @Secured(permissions = {Permission.LOAN_FIND_ONE, Permission.LOAN_FIND_ALL})
    @Get("/{id}")
    public Mono<RestResponse<GetLoanDetailsUseCaseResponse>> getOne(@PathVariable Long id) {
        return getLoanDetailsUseCase.execute(new GetLoanDetailsUseCaseRequest(id))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to fetch loan: " + err.getMessage())));
    }

    /**
     * Update loan metadata.
     */
    @Secured(permissions = {Permission.LOAN_UPDATE})
    @Put("/{id}")
    public Mono<RestResponse<UpdateLoanUseCaseResponse>> update(
            @PathVariable Long id,
            @Body UpdateLoanUseCaseRequest request
    ) {
        UpdateLoanUseCaseRequest finalRequest = new UpdateLoanUseCaseRequest(
                id,
                request.lenderName(),
                request.lenderType(),
                request.phoneNumber(),
                request.accountNumber(),
                request.purpose(),
                request.remarks(),
                request.status()
        );
        return updateLoanUseCase.execute(finalRequest)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to update loan: " + err.getMessage())));
    }

    /**
     * Delete loan and its associated schedules and transactions.
     */
    @Secured(permissions = {Permission.LOAN_DELETE})
    @Delete("/{id}")
    public Mono<RestResponse<DeleteLoanUseCaseResponse>> delete(@PathVariable Long id) {
        return deleteLoanUseCase.execute(new DeleteLoanUseCaseRequest(id))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to delete loan: " + err.getMessage())));
    }

    /**
     * Record a loan repayment or disbursement transaction with backend balance and schedule updates.
     */
    @Secured(permissions = {Permission.LOAN_PAYMENT})
    @Post("/{id}/payments")
    public Mono<RestResponse<RecordLoanPaymentUseCaseResponse>> recordPayment(
            @PathVariable Long id,
            @Body RecordLoanPaymentUseCaseRequest request
    ) {
        RecordLoanPaymentUseCaseRequest finalRequest = new RecordLoanPaymentUseCaseRequest(
                id,
                request.type(),
                request.amount(),
                request.paymentDate(),
                request.paymentMode(),
                request.principalComponent(),
                request.interestComponent(),
                request.referenceNo(),
                request.remarks()
        );
        return recordLoanPaymentUseCase.execute(finalRequest)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to record payment: " + err.getMessage())));
    }

    /**
     * Record payment alternative endpoint directly accepting loanId in request body.
     */
    @Secured(permissions = {Permission.LOAN_PAYMENT})
    @Post("/payments")
    public Mono<RestResponse<RecordLoanPaymentUseCaseResponse>> recordPaymentDirect(
            @Body RecordLoanPaymentUseCaseRequest request
    ) {
        return recordLoanPaymentUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to record payment: " + err.getMessage())));
    }

    /**
     * Retrieve transactions for a specific loan.
     */
    @Secured(permissions = {Permission.LOAN_PAYMENT, Permission.LOAN_FIND_ONE, Permission.LOAN_FIND_ALL})
    @Get("/{id}/transactions")
    public Mono<RestResponse<List<LoanTransactionDto>>> getTransactionsByLoan(@PathVariable Long id) {
        return getLoanTransactionsUseCase.execute(new GetLoanTransactionsUseCaseRequest(id))
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to fetch transactions: " + err.getMessage())));
    }
}
