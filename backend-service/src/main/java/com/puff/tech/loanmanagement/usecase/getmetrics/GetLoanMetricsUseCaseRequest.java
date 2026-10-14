package com.puff.tech.loanmanagement.usecase.getmetrics;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetLoanMetricsUseCaseRequest() implements UCRequest {}
