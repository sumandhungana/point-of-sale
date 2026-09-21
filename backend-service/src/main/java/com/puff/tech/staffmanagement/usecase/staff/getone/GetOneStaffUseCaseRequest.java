package com.puff.tech.staffmanagement.usecase.staff.getone;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneStaffUseCaseRequest(
        Integer id
) implements UCRequest {
}
