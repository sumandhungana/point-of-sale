package com.puff.tech.loanmanagement.usecase.getall;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAllLoansUseCaseRequest() implements UCRequest {}
